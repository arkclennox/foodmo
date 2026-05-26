/**
 * Batched image-to-R2 sync endpoint.
 *
 * Finds listings whose featuredImageUrl or galleryImages still contain
 * external URLs, ingests them into R2, and returns the remaining count
 * so the client can keep calling until done.
 *
 * To stay under Vercel's 60s function limit even when individual images
 * are slow:
 *   - default batch size of 5 listings per call (hard cap 10);
 *   - image fetches WITHIN a listing run in parallel (Promise.all);
 *   - a soft time budget short-circuits the loop and returns whatever
 *     was processed so the client never sees a 504 / HTML error page.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ingestImage } from '@/lib/image-ingest';
import { isR2Url } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_GALLERY = 10;
const DEFAULT_LIMIT = 3;
const HARD_CAP_LIMIT = 8;
const SOFT_TIME_BUDGET_MS = 40_000; // leave ~20s safety from the 60s hard cap
const GALLERY_CONCURRENCY = 3; // cap parallel sharp+upload per listing

type Candidate = {
  id: string;
  slug: string;
  featuredImageUrl: string | null;
  galleryImages: string | null;
};

function parseGallery(raw: string | null): string[] {
  if (!raw || raw === '' || raw === '[]') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function needsMigration(l: Candidate): boolean {
  if (l.featuredImageUrl && !isR2Url(l.featuredImageUrl)) return true;
  const gallery = parseGallery(l.galleryImages);
  return gallery.some((u) => u && !isR2Url(u));
}

async function findPending(): Promise<Candidate[]> {
  const all = await prisma.listing.findMany({
    where: {
      status: 'published',
      OR: [
        { featuredImageUrl: { not: null } },
        {
          AND: [
            { galleryImages: { not: null } },
            { galleryImages: { not: '' } },
            { galleryImages: { not: '[]' } },
          ],
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      featuredImageUrl: true,
      galleryImages: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  return all.filter(needsMigration);
}

async function migrateOne(l: Candidate): Promise<{ ok: number; fail: number }> {
  let ok = 0;
  let fail = 0;
  const update: { featuredImageUrl?: string | null; galleryImages?: string | null } = {};
  let changed = false;

  // Featured
  if (l.featuredImageUrl && !isR2Url(l.featuredImageUrl)) {
    try {
      const r = await ingestImage({
        source: l.featuredImageUrl,
        slug: l.slug,
        prefix: 'listings/featured',
      });
      update.featuredImageUrl = r.url;
      ok++;
      changed = true;
    } catch {
      fail++;
    }
  }

  // Gallery — parallelise the per-URL ingest so a listing with 10
  // images doesn't serially eat 20s of function time.
  const gallery = parseGallery(l.galleryImages);
  if (gallery.length > 0) {
    const seen = new Set<string>();
    const dedup = gallery.filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
    const capped = dedup.slice(0, MAX_GALLERY);

    type ItemResult =
      | { kind: 'keep'; url: string }
      | { kind: 'ok'; url: string }
      | { kind: 'fail' };

    const ingestSingle = async (src: string): Promise<ItemResult> => {
      if (isR2Url(src)) return { kind: 'keep', url: src };
      try {
        const r = await ingestImage({
          source: src,
          slug: l.slug,
          prefix: 'listings/gallery',
        });
        return { kind: 'ok', url: r.url };
      } catch {
        return { kind: 'fail' };
      }
    };

    // Bounded-concurrency worker pool — paralel but capped so Vercel
    // function doesn't OOM on 10 simultaneous sharp pipelines.
    const results: ItemResult[] = new Array(capped.length);
    let cursor = 0;
    const workers = Array.from(
      { length: Math.min(GALLERY_CONCURRENCY, capped.length) },
      async () => {
        while (true) {
          const i = cursor++;
          if (i >= capped.length) return;
          results[i] = await ingestSingle(capped[i]);
        }
      },
    );
    await Promise.all(workers);

    const out: string[] = [];
    let galleryChanged = false;
    for (const r of results) {
      if (r.kind === 'keep') out.push(r.url);
      else if (r.kind === 'ok') {
        out.push(r.url);
        ok++;
        galleryChanged = true;
      } else {
        fail++;
        galleryChanged = true;
      }
    }
    if (galleryChanged) {
      update.galleryImages = out.length > 0 ? JSON.stringify(out) : null;
      changed = true;
    }
  }

  // If listing had no featured but now has at least one gallery R2 URL,
  // promote the first one as featured.
  if (
    !update.featuredImageUrl &&
    !l.featuredImageUrl &&
    update.galleryImages &&
    update.galleryImages !== '[]'
  ) {
    try {
      const first = (JSON.parse(update.galleryImages) as string[])[0];
      if (first) update.featuredImageUrl = first;
    } catch {}
  }

  if (changed) {
    await prisma.listing.update({ where: { id: l.id }, data: update });
  }
  return { ok, fail };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const url = new URL(req.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT), 1),
    HARD_CAP_LIMIT,
  );

  let processed = 0;
  let ok = 0;
  let fail = 0;
  let earlyExit = false;

  try {
    const pending = await findPending();
    const batch = pending.slice(0, limit);
    for (const l of batch) {
      if (Date.now() - startedAt > SOFT_TIME_BUDGET_MS) {
        earlyExit = true;
        break;
      }
      try {
        const r = await migrateOne(l);
        ok += r.ok;
        fail += r.fail;
      } catch {
        fail++;
      }
      processed++;
    }
    const remaining = Math.max(0, pending.length - processed);
    return NextResponse.json({
      success: true,
      processed,
      images: { ok, fail },
      remaining,
      totalPending: pending.length,
      earlyExit,
    });
  } catch (e) {
    // Always return JSON so the client never tries to parse HTML.
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SYNC_ERROR', message: (e as Error).message },
        partial: { processed, images: { ok, fail } },
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const pending = await findPending();
    return NextResponse.json({ success: true, pending: pending.length });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'STAT_ERROR', message: (e as Error).message },
      },
      { status: 500 },
    );
  }
}
