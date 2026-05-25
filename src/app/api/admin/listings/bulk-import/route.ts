import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { toJsonString } from '@/lib/json-fields';
import { ingestImage } from '@/lib/image-ingest';
import { isR2Url } from '@/lib/r2';

const MAX_GALLERY = 10;

async function ingestUrlOrNull(
  src: string | null | undefined,
  slug: string,
  prefix: string,
): Promise<string | null> {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (isR2Url(trimmed)) return trimmed;
  try {
    const { url } = await ingestImage({ source: trimmed, slug, prefix });
    return url;
  } catch {
    return null;
  }
}

async function ingestGalleryUrls(
  raw: unknown,
  slug: string,
): Promise<string[]> {
  if (!Array.isArray(raw)) return [];
  const dedup: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const s = String(item ?? '').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    dedup.push(s);
    if (dedup.length >= MAX_GALLERY) break;
  }
  const out: string[] = [];
  for (const src of dedup) {
    const url = await ingestUrlOrNull(src, slug, 'listings/gallery');
    if (url) out.push(url);
  }
  return out;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }

  const { data } = body;
  if (!Array.isArray(data)) {
    return ERR.validation('Format data salah. Harus berupa array.');
  }

  let imported = 0;
  let skipped = 0;

  for (const row of data) {
    if (!row.name) {
      skipped++;
      continue;
    }

    // 1. Resolve Category
    let categoryId = null;
    if (row.categoryName) {
      const catSlug = slugify(row.categoryName);
      let cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: row.categoryName, slug: catSlug, type: 'listing' },
        });
      }
      categoryId = cat.id;
    }

    // 2. Resolve City
    let cityId = null;
    if (row.cityName) {
      const citySlug = slugify(row.cityName);
      let city = await prisma.city.findUnique({ where: { slug: citySlug } });
      if (!city) {
        city = await prisma.city.create({
          data: { name: row.cityName, slug: citySlug },
        });
      }
      cityId = city.id;
    }

    // 3. Check Duplicate
    const existing = await prisma.listing.findFirst({
      where: {
        name: { equals: row.name, mode: 'insensitive' },
        cityId: cityId,
      },
    });

    if (existing) {
      skipped++;
      continue; // Lewati jika sudah ada
    }

    // Check slug collision
    let slug = row.slug ? slugify(row.slug) : slugify(row.name);
    let slugCollision = await prisma.listing.findUnique({ where: { slug } });
    if (slugCollision) {
      // Jika slug tabrakan tapi bukan di kota yang sama (karena sudah lewat cek di atas), 
      // tambahkan random string agar tetap bisa masuk
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // 4. Ingest images to R2 so we never depend on the upstream source
    const featuredUrl = await ingestUrlOrNull(
      row.featuredImageUrl,
      slug,
      'listings/featured',
    );
    const gallery = await ingestGalleryUrls(row.galleryImages, slug);

    // 5. Create Listing
    await prisma.listing.create({
      data: {
        name: row.name,
        slug: slug,
        description: row.description || '',
        shortDescription: row.shortDescription || null,
        address: row.address || '',
        phone: row.phone || null,
        whatsapp: row.whatsapp || null,
        websiteUrl: row.websiteUrl || null,
        instagramUrl: row.instagramUrl || null,
        shopeeFoodUrl: row.shopeeFoodUrl || null,
        tiktokUrl: row.tiktokUrl || null,
        googleMapsUrl: row.googleMapsUrl || null,
        priceRange: row.priceRange || null,
        rating: row.rating || 0,
        latitude: row.latitude || null,
        longitude: row.longitude || null,
        categoryId,
        cityId,
        facilities: row.facilities ? toJsonString(row.facilities) : '[]',
        menuHighlights: row.menuHighlights ? toJsonString(row.menuHighlights) : '[]',
        galleryImages: gallery.length > 0 ? JSON.stringify(gallery) : '[]',
        featuredImageUrl: featuredUrl,
        status: 'published',
        isFeatured: false,
      },
    });

    imported++;
  }

  return apiSuccess({ imported, skipped });
}
