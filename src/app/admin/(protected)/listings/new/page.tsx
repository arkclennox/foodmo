import { prisma } from '@/lib/db';
import { ListingForm, emptyListingForm } from '@/components/admin/ListingForm';

export const dynamic = 'force-dynamic';

export default async function NewListingPage() {
  const [categories, cities] = await Promise.all([
    prisma.category.findMany({
      where: { type: 'listing' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.city.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-black">Tambah Listing</h1>
      <ListingForm initial={emptyListingForm} categories={categories} cities={cities} />
    </div>
  );
}
