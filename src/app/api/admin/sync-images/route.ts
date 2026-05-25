/**
 * Batched image-to-R2 sync endpoint.
 *
 * Finds listings whose featuredImageUrl or galleryImages still contain
 * external URLs, ingests up to `limit` of them into R2, and returns the
 * remaining count so the client can keep calling until done.
 *
 * Designed to stay under Vercel's serverless timeout — default batch
 * size of 15 leaves headroom even if every image is fetched + sharp
 * processed + uploaded.
 *
 * Admin auth is enforced by middleware (matcher: /api/admin/*).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ingestImage } from '@/lib/image-ingest';
import { isR2Url } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_GALLERY = 10;
const DEFAULT_LIMIT = 15;
const HARD_CAP_LIMIT = 30;

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

  // Gallery
  const gallery = parseGallery(l.galleryImages);
  if (gallery.length > 0) {
    const seen = new Set<string>();
    const dedup = gallery.filter((u) => {
      if (!u || seen.has(u)) return false;
      seen.add(u);
      return true;
    });
    const capped = dedup.slice(0, MAX_GALLERY);
    const out: string[] = [];
    let galleryChanged = false;
    for (const src of capped) {
      if (isR2Url(src)) {
        out.push(src);
        continue;
      }
      try {
        const r = await ingestImage({
          source: src,
          slug: l.slug,
          prefix: 'listings/gallery',
        });
        out.push(r.url);
        ok++;
        galleryChanged = true;
      } catch {
        fail++;
        galleryChanged = true; // dead URL removed
      }
    }
    if (galleryChanged) {
      update.galleryImages = out.length > 0 ? JSON.stringify(out) : null;
      changed = true;
    }
  }

  // Backfill featured from first gallery if still empty
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
  const url = new URL(req.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT), 1),
    HARD_CAP_LIMIT,
  );

  try {
    const pending = await findPending();
    const batch = pending.slice(0, limit);
    let processed = 0;
    let ok = 0;
    let fail = 0;
    for (const l of batch) {
      const r = await migrateOne(l);
      ok += r.ok;
      fail += r.fail;
      processed++;
    }
    return NextResponse.json({
      success: true,
      processed,
      images: { ok, fail },
      remaining: Math.max(0, pending.length - processed),
      totalPending: pending.length,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SYNC_ERROR', message: (e as Error).message },
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Quick stats — useful for UI badge "X listing menunggu sync"
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
