import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ListingForm, type ListingFormData } from '@/components/admin/ListingForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { parseJsonArray } from '@/lib/json-fields';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, categories, cities] = await Promise.all([
    prisma.listing.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { type: 'listing' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);
  if (!listing) notFound();

  const initial: ListingFormData = {
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    description: listing.description,
    shortDescription: listing.shortDescription ?? '',
    categoryId: listing.categoryId ?? '',
    cityId: listing.cityId ?? '',
    address: listing.address,
    latitude: listing.latitude?.toString() ?? '',
    longitude: listing.longitude?.toString() ?? '',
    phone: listing.phone ?? '',
    whatsapp: listing.whatsapp ?? '',
    websiteUrl: listing.websiteUrl ?? '',
    instagramUrl: listing.instagramUrl ?? '',
    priceRange: listing.priceRange ?? '',
    openingHours: listing.openingHours ?? '',
    facilities: parseJsonArray<string>(listing.facilities),
    menuHighlights: parseJsonArray<string>(listing.menuHighlights),
    featuredImageUrl: listing.featuredImageUrl ?? '',
    galleryImages: parseJsonArray<string>(listing.galleryImages),
    status: listing.status,
    isFeatured: listing.isFeatured,
    metaTitle: listing.metaTitle ?? '',
    metaDescription: listing.metaDescription ?? '',
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Edit Listing</h1>
        <div className="flex gap-2">
          <Link
            href={`/tempat-makan/${listing.slug}`}
            target="_blank"
            className="btn-ghost"
          >
            Lihat publik
          </Link>
          <DeleteButton
            endpoint={`/api/admin/listings/${listing.id}`}
            confirmText={`Hapus listing "${listing.name}"?`}
            redirectTo="/admin/listings"
          />
        </div>
      </div>
      <ListingForm
        initial={initial}
        categories={categories}
        cities={cities}
        listingId={listing.id}
      />
    </div>
  );
}
