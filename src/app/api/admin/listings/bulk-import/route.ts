import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { toJsonString } from '@/lib/json-fields';

// Vercel Hobby allows up to 60s function duration with Fluid Compute.
// Bulk-import stays DB-only and is heavily batched so the 60s window
// is enough for ~25-50 rows. Image ingest to R2 runs separately via
// /api/admin/sync-images.
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

  try {
    // ---------- PREFETCH PHASE ----------
    // Resolve all unique categories/cities in one batch of upserts
    // instead of per-row lookups. Then fetch ALL potentially-duplicate
    // listings for the batch in a single query so the row loop only
    // does Map lookups + the single write per row.

    const rows = data.map((r) => r as Record<string, unknown>);

    // Collect unique category/city names appearing in the batch.
    const uniqueCategoryNames = new Set<string>();
    const uniqueCityNames = new Set<string>();
    for (const r of rows) {
      if (typeof r.categoryName === 'string' && r.categoryName.trim())
        uniqueCategoryNames.add(r.categoryName.trim());
      if (typeof r.cityName === 'string' && r.cityName.trim())
        uniqueCityNames.add(r.cityName.trim());
    }

    const categoryIdMap = new Map<string, string>(); // slug -> id
    const cityIdMap = new Map<string, string>();

    // Upsert categories sequentially (small N, usually <30).
    for (const rawName of uniqueCategoryNames) {
      const slug = slugify(rawName);
      const cat = await prisma.category.upsert({
        where: { slug },
        update: {},
        create: { name: rawName, slug, type: 'listing' },
      });
      categoryIdMap.set(slug, cat.id);
    }
    for (const rawName of uniqueCityNames) {
      const slug = slugify(rawName);
      const city = await prisma.city.upsert({
        where: { slug },
        update: {},
        create: { name: rawName, slug },
      });
      cityIdMap.set(slug, city.id);
    }

    const resolvedCityIds = new Set<string>();
    for (const r of rows) {
      if (typeof r.cityName === 'string' && r.cityName.trim()) {
        const id = cityIdMap.get(slugify(r.cityName.trim()));
        if (id) resolvedCityIds.add(id);
      }
    }

    // Single query: pull every published listing in the batch's cities.
    // Typical case: a CSV touches ~5-20 cities, this returns at most
    // a few thousand rows which is fine.
    const candidateListings = resolvedCityIds.size
      ? await prisma.listing.findMany({
          where: { cityId: { in: Array.from(resolvedCityIds) } },
          select: {
            id: true,
            name: true,
            cityId: true,
            description: true,
            shortDescription: true,
            address: true,
            phone: true,
            whatsapp: true,
            websiteUrl: true,
            instagramUrl: true,
            shopeeFoodUrl: true,
            tiktokUrl: true,
            googleMapsUrl: true,
            priceRange: true,
            metaTitle: true,
            metaDescription: true,
            rating: true,
            latitude: true,
            longitude: true,
            featuredImageUrl: true,
            galleryImages: true,
            facilities: true,
            menuHighlights: true,
          },
        })
      : [];

    // Map by (lowerName|cityId) for O(1) duplicate lookup.
    type Existing = (typeof candidateListings)[number];
    const existingMap = new Map<string, Existing>();
    for (const l of candidateListings) {
      existingMap.set(`${l.name.toLowerCase()}|${l.cityId ?? ''}`, l);
    }

    // Pre-fetch all candidate slugs to detect collisions in O(1).
    const proposedSlugs: string[] = [];
    for (const r of rows) {
      const name = typeof r.name === 'string' ? r.name.trim() : '';
      if (!name) continue;
      proposedSlugs.push(
        typeof r.slug === 'string' && r.slug.trim()
          ? slugify(r.slug)
          : slugify(name),
      );
    }
    const slugCollisionRows = proposedSlugs.length
      ? await prisma.listing.findMany({
          where: { slug: { in: proposedSlugs } },
          select: { slug: true },
        })
      : [];
    const takenSlugs = new Set(slugCollisionRows.map((s) => s.slug));

    // ---------- ROW LOOP ----------
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = typeof row.name === 'string' ? row.name.trim() : '';
      if (!name) {
        skipped++;
        continue;
      }

      try {
        const categoryId =
          typeof row.categoryName === 'string' && row.categoryName.trim()
            ? categoryIdMap.get(slugify(row.categoryName.trim())) ?? null
            : null;
        const cityId =
          typeof row.cityName === 'string' && row.cityName.trim()
            ? cityIdMap.get(slugify(row.cityName.trim())) ?? null
            : null;

        const existing = existingMap.get(`${name.toLowerCase()}|${cityId ?? ''}`);

        if (existing) {
          // ---- MERGE PATH ----
          const updates: Record<string, unknown> = {};
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
          if (
            isEmpty(existing.featuredImageUrl) &&
            !isEmpty(row.featuredImageUrl)
          ) {
            updates.featuredImageUrl = String(row.featuredImageUrl).trim();
          }

          const galleryMerge = mergeStringArrays(
            parseArrayField(existing.galleryImages),
            dedupGallery(row.galleryImages),
            MAX_GALLERY,
          );
          if (galleryMerge.changed) {
            updates.galleryImages = JSON.stringify(galleryMerge.merged);
          }
          const facMerge = mergeStringArrays(
            parseArrayField(existing.facilities),
            Array.isArray(row.facilities) ? row.facilities.map(String) : [],
          );
          if (facMerge.changed) {
            updates.facilities = JSON.stringify(facMerge.merged);
          }
          const menuMerge = mergeStringArrays(
            parseArrayField(existing.menuHighlights),
            Array.isArray(row.menuHighlights)
              ? row.menuHighlights.map(String)
              : [],
          );
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

        // ---- CREATE PATH ----
        let slug =
          typeof row.slug === 'string' && row.slug.trim()
            ? slugify(row.slug)
            : slugify(name);
        if (takenSlugs.has(slug)) {
          slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
        }
        takenSlugs.add(slug); // mark as taken so later rows in same batch don't reuse

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
            menuHighlights: row.menuHighlights
              ? toJsonString(row.menuHighlights)
              : '[]',
            galleryImages:
              galleryRaw.length > 0 ? JSON.stringify(galleryRaw) : '[]',
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

    return apiSuccess({
      imported,
      merged,
      skipped,
      errors: errors.slice(0, 10),
    });
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
