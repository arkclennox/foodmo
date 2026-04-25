import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { authenticateApiKey } from '@/lib/api-key-guard';
import { slugify } from '@/lib/slug';
import { listingPatchSchema } from '@/lib/validators';
import { toJsonString } from '@/lib/json-fields';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  const auth = await authenticateApiKey(req, 'listings:update');
  if (!auth.ok) return auth.response;

  const { idOrSlug } = await params;
  const existing = await prisma.listing.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
  });
  if (!existing) return ERR.notFound('Listing tidak ditemukan');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }

  const parsed = listingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return ERR.validation('Data tidak valid', parsed.error.format());
  }

  const input = parsed.data;
  let newSlug = existing.slug;
  if (input.slug !== undefined && input.slug !== null) {
    newSlug = input.slug.trim() || slugify(input.name || existing.name);
    if (newSlug !== existing.slug) {
      const conflict = await prisma.listing.findUnique({ where: { slug: newSlug } });
      if (conflict) return ERR.conflict(`Slug "${newSlug}" sudah dipakai`);
    }
  }

  // Mencegah perubahan nama/kota menjadi duplikat dengan listing lain
  if (input.name !== undefined || input.cityId !== undefined) {
    const checkName = input.name ?? existing.name;
    const checkCity = input.cityId !== undefined ? input.cityId : existing.cityId;
    
    const duplicate = await prisma.listing.findFirst({
      where: {
        id: { not: existing.id },
        name: { equals: checkName, mode: 'insensitive' },
        cityId: checkCity || null,
      },
    });
    if (duplicate) return ERR.conflict(`Listing dengan nama "${checkName}" di kota tersebut sudah terdaftar`);
  }


  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription;
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.cityId !== undefined) data.cityId = input.cityId;
  if (input.address !== undefined) data.address = input.address;
  if (input.latitude !== undefined) data.latitude = input.latitude;
  if (input.longitude !== undefined) data.longitude = input.longitude;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.whatsapp !== undefined) data.whatsapp = input.whatsapp;
  if (input.websiteUrl !== undefined) data.websiteUrl = input.websiteUrl;
  if (input.instagramUrl !== undefined) data.instagramUrl = input.instagramUrl;
  if (input.shopeeFoodUrl !== undefined) data.shopeeFoodUrl = input.shopeeFoodUrl;
  if (input.tiktokUrl !== undefined) data.tiktokUrl = input.tiktokUrl;
  if (input.googleMapsUrl !== undefined) data.googleMapsUrl = input.googleMapsUrl;
  if (input.priceRange !== undefined) data.priceRange = input.priceRange;
  if (input.openingHours !== undefined) data.openingHours = input.openingHours;
  if (input.facilities !== undefined) data.facilities = toJsonString(input.facilities);
  if (input.menuHighlights !== undefined) data.menuHighlights = toJsonString(input.menuHighlights);
  if (input.featuredImageUrl !== undefined) data.featuredImageUrl = input.featuredImageUrl;
  if (input.galleryImages !== undefined) data.galleryImages = toJsonString(input.galleryImages);
  if (input.status !== undefined) data.status = input.status;
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
  if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
  if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;
  data.slug = newSlug;

  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data,
  });

  return apiSuccess(updated);
}
