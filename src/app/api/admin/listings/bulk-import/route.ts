import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { toJsonString } from '@/lib/json-fields';

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

    // 4. Create Listing
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
        galleryImages: row.galleryImages ? toJsonString(row.galleryImages) : '[]',
        featuredImageUrl: row.featuredImageUrl || null,
        status: 'published',
        isFeatured: false,
      },
    });

    imported++;
  }

  return apiSuccess({ imported, skipped });
}
