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
  let merged = 0;
  let skipped = 0;
  const errors: Array<{ row: number; name?: string; reason: string }> = [];

  function isEmpty(v: unknown): boolean {
    if (v == null) return true;
    if (typeof v === 'string') return v.trim() === '';
    return false;
  }

  function parseArrayField(raw: string | null | undefined): string[] {
    if (!raw || raw === '' || raw === '[]') return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function mergeStringArrays(
    existing: string[],
    incoming: string[],
    cap?: number,
  ): { merged: string[]; changed: boolean } {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of [...existing, ...incoming]) {
      const t = (v || '').trim();
      if (!t || seen.has(t)) continue;
      seen.add(t);
      out.push(t);
      if (cap && out.length >= cap) break;
    }
    return { merged: out, changed: out.length !== existing.length };
  }

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

        // 3. Check duplicate by (name, cityId). If found, smart-merge:
        //    only fill empty fields and append (dedup, cap) to arrays.
        const existing = await prisma.listing.findFirst({
          where: { name: { equals: name, mode: 'insensitive' }, cityId },
        });
        if (existing) {
          const updates: Record<string, unknown> = {};

          // Text/scalar fields: only set when existing value is empty.
          const textPairs: Array<[string, string, unknown]> = [
            ['description', 'description', row.description],
            ['shortDescription', 'shortDescription', row.shortDescription],
            ['address', 'address', row.address],
            ['phone', 'phone', row.phone],
            ['whatsapp', 'whatsapp', row.whatsapp],
            ['websiteUrl', 'websiteUrl', row.websiteUrl],
            ['instagramUrl', 'instagramUrl', row.instagramUrl],
            ['shopeeFoodUrl', 'shopeeFoodUrl', row.shopeeFoodUrl],
            ['tiktokUrl', 'tiktokUrl', row.tiktokUrl],
            ['googleMapsUrl', 'googleMapsUrl', row.googleMapsUrl],
            ['priceRange', 'priceRange', row.priceRange],
            ['metaTitle', 'metaTitle', row.metaTitle],
            ['metaDescription', 'metaDescription', row.metaDescription],
          ];
          for (const [key, existingKey, newVal] of textPairs) {
            if (
              isEmpty((existing as Record<string, unknown>)[existingKey]) &&
              !isEmpty(newVal)
            ) {
              updates[key] = String(newVal).trim();
            }
          }

          // Numeric fields
          if (
            (existing.rating === 0 || existing.rating == null) &&
            typeof row.rating === 'number' &&
            row.rating > 0
          ) {
            updates.rating = row.rating;
          }
          if (existing.latitude == null && typeof row.latitude === 'number') {
            updates.latitude = row.latitude;
          }
          if (existing.longitude == null && typeof row.longitude === 'number') {
            updates.longitude = row.longitude;
          }

          // Featured image: only set if empty.
          if (
            isEmpty(existing.featuredImageUrl) &&
            !isEmpty(row.featuredImageUrl)
          ) {
            updates.featuredImageUrl = String(row.featuredImageUrl).trim();
          }

          // Gallery: union + dedup + cap. Keep existing order first so
          // already-R2 URLs stay at the front.
          const existingGallery = parseArrayField(existing.galleryImages);
          const incomingGallery = dedupGallery(row.galleryImages);
          const galleryMerge = mergeStringArrays(
            existingGallery,
            incomingGallery,
            MAX_GALLERY,
          );
          if (galleryMerge.changed) {
            updates.galleryImages = JSON.stringify(galleryMerge.merged);
          }

          // Facilities & menuHighlights: union + dedup (no cap).
          const existingFac = parseArrayField(existing.facilities);
          const incomingFac = Array.isArray(row.facilities)
            ? row.facilities.map(String)
            : [];
          const facMerge = mergeStringArrays(existingFac, incomingFac);
          if (facMerge.changed) {
            updates.facilities = JSON.stringify(facMerge.merged);
          }

          const existingMenu = parseArrayField(existing.menuHighlights);
          const incomingMenu = Array.isArray(row.menuHighlights)
            ? row.menuHighlights.map(String)
            : [];
          const menuMerge = mergeStringArrays(existingMenu, incomingMenu);
          if (menuMerge.changed) {
            updates.menuHighlights = JSON.stringify(menuMerge.merged);
          }

          if (Object.keys(updates).length > 0) {
            await prisma.listing.update({
              where: { id: existing.id },
              data: updates,
            });
            merged++;
          } else {
            skipped++;
          }
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

    return apiSuccess({ imported, merged, skipped, errors: errors.slice(0, 10) });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BULK_IMPORT_ERROR',
          message: (e as Error).message ?? 'Bulk import failed',
        },
        partial: { imported, merged, skipped, errors },
      },
      { status: 500 },
    );
  }
}
