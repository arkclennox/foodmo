import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Directory } from '@/components/Directory';
import { buildMetadata } from '@/lib/seo';
import { listCategories, listCities, listFacilities, listListings } from '@/lib/queries';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { toCardData } from '@/lib/listing-index';

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: 'Direktori Tempat Makan',
  description:
    'Jelajahi direktori restoran, cafe, dan warung makan di seluruh Indonesia — filter berdasarkan kota, kategori, harga, dan fasilitas.',
  path: '/tempat-makan',
});

export default async function DirectoryPage() {
  const [categories, cities, facilities, result] = await Promise.all([
    listCategories('listing'),
    listCities(),
    listFacilities(),
    listListings({ sort: 'latest', page: 1, limit: DEFAULT_PAGE_SIZE }),
  ]);

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Direktori' }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Direktori Tempat Makan</h1>
        <p className="mt-1 text-black/70">
          Filter berdasarkan kota, kategori, harga, dan fasilitas untuk menyesuaikan pencarian.
        </p>
      </div>
      <Directory
        options={{
          basePath: '/tempat-makan',
          categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
          cities: cities.map((c) => ({ slug: c.slug, name: c.name })),
          facilities,
        }}
        initial={{
          items: result.items.map(toCardData),
          total: result.total,
          totalPages: result.totalPages,
        }}
        pageSize={DEFAULT_PAGE_SIZE}
      />
    </div>
  );
}
