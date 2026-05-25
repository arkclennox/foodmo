/**
 * One-time migration: move every image URL stored in the DB to
 * Cloudflare R2 so we no longer depend on Google's expiring `gps-cs-s`
 * tokens or Vercel's image-optimization quota.
 *
 * Scope:
 *   - Listing.featuredImageUrl
 *   - Listing.galleryImages (JSON array, capped at MAX_GALLERY after dedup)
 *   - Article.featuredImageUrl
 *
 * Behaviour:
 *   - Already-R2 URLs are skipped (idempotent — safe to re-run).
 *   - Dead/403 source URLs are dropped (gallery) or left null (featured).
 *   - Resumable: progress is logged so partial runs can continue.
 *
 * Usage:
 *   npx tsx scripts/migrate-images-to-r2.ts --dry
 *   npx tsx scripts/migrate-images-to-r2.ts --apply [--concurrency 8] [--listings] [--articles]
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ingestImage } from '../src/lib/image-ingest';
import { isR2Url } from '../src/lib/r2';

const prisma = new PrismaClient();

const MAX_GALLERY = 10;

type Stats = {
  listingsScanned: number;
  listingsUpdated: number;
  featuredOk: number;
  featuredFail: number;
  featuredSkipped: number;
  galleryOk: number;
  galleryFail: number;
  galleryDeduped: number;
  galleryCapped: number;
  articlesScanned: number;
  articlesUpdated: number;
  articleFeaturedOk: number;
  articleFeaturedFail: number;
};

const stats: Stats = {
  listingsScanned: 0,
  listingsUpdated: 0,
  featuredOk: 0,
  featuredFail: 0,
  featuredSkipped: 0,
  galleryOk: 0,
  galleryFail: 0,
  galleryDeduped: 0,
  galleryCapped: 0,
  articlesScanned: 0,
  articlesUpdated: 0,
  articleFeaturedOk: 0,
  articleFeaturedFail: 0,
};

function dedupKeepingOrder(items: string[]): { kept: string[]; dropped: number } {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const u of items) {
    const trimmed = (u || '').trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    kept.push(trimmed);
  }
  return { kept, dropped: items.length - kept.length };
}

async function tryIngest(
  src: string,
  slug: string,
  prefix: string,
): Promise<string | null> {
  try {
    const r = await ingestImage({ source: src, slug, prefix });
    return r.url;
  } catch {
    return null;
  }
}

async function migrateListing(l: {
  id: string;
  slug: string;
  featuredImageUrl: string | null;
  galleryImages: string | null;
}) {
  stats.listingsScanned++;
  let changed = false;
  const update: { featuredImageUrl?: string | null; galleryImages?: string | null } = {};

  // --- featured ---
  if (l.featuredImageUrl) {
    if (isR2Url(l.featuredImageUrl)) {
      stats.featuredSkipped++;
    } else {
      const url = await tryIngest(l.featuredImageUrl, l.slug, 'listings/featured');
      if (url) {
        update.featuredImageUrl = url;
        stats.featuredOk++;
        changed = true;
      } else {
        // leave the old (dead) URL in place — UI will fall back to placeholder.
        stats.featuredFail++;
      }
    }
  }

  // --- gallery ---
  if (l.galleryImages && l.galleryImages !== '' && l.galleryImages !== '[]') {
    let raw: string[] = [];
    try {
      const parsed = JSON.parse(l.galleryImages);
      raw = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      raw = [];
    }
    if (raw.length > 0) {
      const { kept, dropped } = dedupKeepingOrder(raw);
      stats.galleryDeduped += dropped;

      const limited = kept.slice(0, MAX_GALLERY);
      if (kept.length > MAX_GALLERY) stats.galleryCapped += kept.length - MAX_GALLERY;

      const out: string[] = [];
      for (const src of limited) {
        if (isR2Url(src)) {
          out.push(src);
          continue;
        }
        const url = await tryIngest(src, l.slug, 'listings/gallery');
        if (url) {
          out.push(url);
          stats.galleryOk++;
        } else {
          stats.galleryFail++;
        }
      }
      const next = JSON.stringify(out);
      if (next !== l.galleryImages) {
        update.galleryImages = out.length > 0 ? next : null;
        changed = true;
      }
    }
  }

  if (changed) {
    await prisma.listing.update({ where: { id: l.id }, data: update });
    stats.listingsUpdated++;
  }
}

async function migrateArticle(a: {
  id: string;
  slug: string;
  featuredImageUrl: string | null;
}) {
  stats.articlesScanned++;
  if (!a.featuredImageUrl) return;
  if (isR2Url(a.featuredImageUrl)) return;
  const url = await tryIngest(a.featuredImageUrl, a.slug, 'articles/featured');
  if (url) {
    await prisma.article.update({
      where: { id: a.id },
      data: { featuredImageUrl: url },
    });
    stats.articleFeaturedOk++;
    stats.articlesUpdated++;
  } else {
    stats.articleFeaturedFail++;
  }
}

async function workerPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, idx: number) => Promise<void>,
) {
  let cursor = 0;
  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = cursor++;
          if (i >= items.length) return;
          try {
            await fn(items[i], i);
          } catch (e) {
            // Per-item failure shouldn't kill the worker.
            console.error('worker item error', (e as Error).message);
          }
          if (i > 0 && i % 50 === 0) {
            console.log(
              `[progress] ${i}/${items.length}  featured ok=${stats.featuredOk} fail=${stats.featuredFail}  gallery ok=${stats.galleryOk} fail=${stats.galleryFail}`,
            );
          }
        }
      })(),
    );
  }
  await Promise.all(workers);
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const apply = args.includes('--apply');
  const concIdx = args.indexOf('--concurrency');
  const concurrency =
    concIdx >= 0 && args[concIdx + 1] ? Number(args[concIdx + 1]) : 8;
  const onlyListings = args.includes('--listings');
  const onlyArticles = args.includes('--articles');
  const runListings = !onlyArticles;
  const runArticles = !onlyListings;

  if (!dry && !apply) {
    console.error('Usage: --dry | --apply [--concurrency N] [--listings|--articles]');
    process.exit(1);
  }

  if (runListings) {
    const listings = await prisma.listing.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        slug: true,
        featuredImageUrl: true,
        galleryImages: true,
      },
    });
    console.log(`Listings to process: ${listings.length}`);

    if (dry) {
      // tiny preview for the first 5
      for (const l of listings.slice(0, 5)) {
        let gallerySize = 0;
        try {
          gallerySize = Array.isArray(JSON.parse(l.galleryImages ?? '[]'))
            ? JSON.parse(l.galleryImages ?? '[]').length
            : 0;
        } catch {}
        console.log(
          `  ${l.slug.padEnd(50)} featured=${l.featuredImageUrl ? 'Y' : '-'} gallery=${gallerySize}`,
        );
      }
      console.log('(dry) skipping uploads. Run with --apply to execute.');
    } else {
      await workerPool(listings, concurrency, migrateListing);
    }
  }

  if (runArticles) {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: { id: true, slug: true, featuredImageUrl: true },
    });
    console.log(`Articles to process: ${articles.length}`);
    if (!dry) {
      await workerPool(articles, Math.min(concurrency, 4), migrateArticle);
    }
  }

  console.log('\n=== Summary ===');
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
