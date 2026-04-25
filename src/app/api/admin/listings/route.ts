import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { listingInputSchema } from '@/lib/validators';
import { toJsonString } from '@/lib/json-fields';

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      category: { select: { name: true, slug: true } },
      city: { select: { name: true, slug: true } },
    },
  });
  return apiSuccess(listings);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = listingInputSchema.safeParse(body);
  if (!parsed.success) {
    return ERR.validation('Data tidak valid', parsed.error.format());
  }
  const input = parsed.data;
  const slug = input.slug?.trim() || slugify(input.name);
  const existing = await prisma.listing.findUnique({ where: { slug } });
  if (existing) return ERR.conflict(`Slug "${slug}" sudah dipakai`);

  // Mencegah duplicate berdasar nama dan kota
  const duplicate = await prisma.listing.findFirst({
    where: {
      name: { equals: input.name, mode: 'insensitive' },
      cityId: input.cityId || null,
    },
  });
  if (duplicate) return ERR.conflict(`Listing dengan nama "${input.name}" di kota tersebut sudah terdaftar`);


  const created = await prisma.listing.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      shortDescription: input.shortDescription ?? null,
      categoryId: input.categoryId ?? null,
      cityId: input.cityId ?? null,
      address: input.address,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      phone: input.phone ?? null,
      whatsapp: input.whatsapp ?? null,
      websiteUrl: input.websiteUrl ?? null,
      instagramUrl: input.instagramUrl ?? null,
      shopeeFoodUrl: input.shopeeFoodUrl ?? null,
      tiktokUrl: input.tiktokUrl ?? null,
      googleMapsUrl: input.googleMapsUrl ?? null,
      priceRange: input.priceRange ?? null,

      openingHours: input.openingHours ?? null,
      facilities: toJsonString(input.facilities ?? []),
      menuHighlights: toJsonString(input.menuHighlights ?? []),
      featuredImageUrl: input.featuredImageUrl ?? null,
      galleryImages: toJsonString(input.galleryImages ?? []),
      status: input.status,
      isFeatured: input.isFeatured ?? false,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
    },
  });
  return apiSuccess(created, { status: 201 });
}
