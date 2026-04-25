import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { listingPatchSchema } from '@/lib/validators';
import { toJsonString } from '@/lib/json-fields';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return ERR.notFound('Listing tidak ditemukan');
  return apiSuccess(listing);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
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
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return ERR.notFound('Listing tidak ditemukan');

  let slug = existing.slug;
  if (input.slug !== undefined && input.slug !== null) {
    const newSlug = input.slug.trim() || slugify(input.name ?? existing.name);
    if (newSlug !== existing.slug) {
      const conflict = await prisma.listing.findUnique({ where: { slug: newSlug } });
      if (conflict && conflict.id !== id) {
        return ERR.conflict(`Slug "${newSlug}" sudah dipakai`);
      }
      slug = newSlug;
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
  if (input.categoryId !== undefined) data.categoryId = input.categoryId ?? null;
  if (input.cityId !== undefined) data.cityId = input.cityId ?? null;
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
  data.slug = slug;

  const updated = await prisma.listing.update({ where: { id }, data });
  return apiSuccess(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.listing.findUnique({ where: { id } });
  if (!existing) return ERR.notFound('Listing tidak ditemukan');
  await prisma.listing.delete({ where: { id } });
  return apiSuccess({ ok: true });
}
