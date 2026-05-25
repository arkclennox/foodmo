import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { toJsonString } from '@/lib/json-fields';

// Vercel function timeout (Hobby tier allows up to 60s with Fluid Compute).
// Bulk-import stays synchronous DB-only — image ingest to R2 runs as a
// separate step (scripts/migrate-images-to-r2.ts) because per-row fetch +
// sharp + upload is far too slow to fit in a single request.
export const maxDuration = 60;

const MAX_GALLERY = 10;

function dedupGallery(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const s = String(item ?? '').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= MAX_GALLERY) break;
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: { data?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }

  const data = body.data;
  if (!Array.isArray(data)) {
    return ERR.validation('Format data salah. Harus berupa array.');
  }

  let imported = 0;
  let skipped = 0;
  const errors: Array<{ row: number; name?: string; reason: string }> = [];

  try {
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, unknown>;
      const name = typeof row.name === 'string' ? row.name.trim() : '';
      if (!name) {
        skipped++;
        continue;
      }

      try {
        // 1. Resolve Category
        let categoryId: string | null = null;
        if (typeof row.categoryName === 'string' && row.categoryName.trim()) {
          const catSlug = slugify(row.categoryName);
          const cat = await prisma.category.upsert({
            where: { slug: catSlug },
            update: {},
            create: { name: row.categoryName, slug: catSlug, type: 'listing' },
          });
          categoryId = cat.id;
        }

        // 2. Resolve City
        let cityId: string | null = null;
        if (typeof row.cityName === 'string' && row.cityName.trim()) {
          const citySlug = slugify(row.cityName);
          const city = await prisma.city.upsert({
            where: { slug: citySlug },
            update: {},
            create: { name: row.cityName, slug: citySlug },
          });
          cityId = city.id;
        }

        // 3. Check duplicate by (name, cityId)
        const existing = await prisma.listing.findFirst({
          where: { name: { equals: name, mode: 'insensitive' }, cityId },
        });
        if (existing) {
          skipped++;
          continue;
        }

        // 4. Slug
        let slug =
          typeof row.slug === 'string' && row.slug.trim()
            ? slugify(row.slug)
            : slugify(name);
        const collision = await prisma.listing.findUnique({ where: { slug } });
        if (collision) slug = `${slug}-${Math.floor(Math.random() * 10000)}`;

        // 5. Insert — images stored AS-IS. Run the migrate-images-to-r2
        //    script afterwards to push them to R2.
        const galleryRaw = dedupGallery(row.galleryImages);
        await prisma.listing.create({
          data: {
            name,
            slug,
            description: (row.description as string) || '',
            shortDescription: (row.shortDescription as string) || null,
            address: (row.address as string) || '',
            phone: (row.phone as string) || null,
            whatsapp: (row.whatsapp as string) || null,
            websiteUrl: (row.websiteUrl as string) || null,
            instagramUrl: (row.instagramUrl as string) || null,
            shopeeFoodUrl: (row.shopeeFoodUrl as string) || null,
            tiktokUrl: (row.tiktokUrl as string) || null,
            googleMapsUrl: (row.googleMapsUrl as string) || null,
            priceRange: (row.priceRange as string) || null,
            rating: typeof row.rating === 'number' ? row.rating : 0,
            latitude: typeof row.latitude === 'number' ? row.latitude : null,
            longitude: typeof row.longitude === 'number' ? row.longitude : null,
            categoryId,
            cityId,
            facilities: row.facilities ? toJsonString(row.facilities) : '[]',
            menuHighlights: row.menuHighlights ? toJsonString(row.menuHighlights) : '[]',
            galleryImages: galleryRaw.length > 0 ? JSON.stringify(galleryRaw) : '[]',
            featuredImageUrl: (row.featuredImageUrl as string) || null,
            status: 'published',
            isFeatured: false,
          },
        });
        imported++;
      } catch (rowErr) {
        errors.push({
          row: i + 1,
          name,
          reason: (rowErr as Error).message ?? 'unknown',
        });
        skipped++;
      }
    }

    return apiSuccess({ imported, skipped, errors: errors.slice(0, 10) });
  } catch (e) {
    // Always return JSON so the client's res.json() doesn't choke on an
    // HTML error page.
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BULK_IMPORT_ERROR',
          message: (e as Error).message ?? 'Bulk import failed',
        },
        partial: { imported, skipped, errors },
      },
      { status: 500 },
    );
  }
}
