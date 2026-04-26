import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ListingCard } from '@/components/ListingCard';
import { ListingFilter } from '@/components/ListingFilter';
import { Pagination } from '@/components/Pagination';
import { buildMetadata } from '@/lib/seo';
import { listCategories, listCities, listFacilities, listListings } from '@/lib/queries';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { parsePagination } from '@/lib/pagination';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: 'Direktori Tempat Makan',
  description:
    'Jelajahi direktori restoran, cafe, dan warung makan di seluruh Indonesia — filter berdasarkan kota, kategori, harga, dan fasilitas.',
  path: '/tempat-makan',
});

function oneOf(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const state = {
    search: oneOf(params.search),
    category: oneOf(params.category),
    city: oneOf(params.city),
    price: oneOf(params.price),
    facility: oneOf(params.facility),
    sort: oneOf(params.sort) || 'latest',
  };
  const { page, limit } = parsePagination(params, { limit: DEFAULT_PAGE_SIZE });

  const [categories, cities, facilities, result] = await Promise.all([
    listCategories('listing'),
    listCities(),
    listFacilities(),
    listListings({
      search: state.search,
      categorySlug: state.category,
      citySlug: state.city,
      priceRange: state.price,
      facility: state.facility,
      sort: state.sort as 'latest' | 'rating' | 'name' | 'featured',
      page,
      limit,
    }),
  ]);

  const buildPageHref = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v) qs.set(k, String(v));
    });
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/tempat-makan?${s}` : '/tempat-makan';
  };

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Direktori' }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Direktori Tempat Makan</h1>
        <p className="mt-1 text-black/70">
          {result.total.toLocaleString('id-ID')} tempat makan ditemukan — filter untuk menyesuaikan pencarian.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <ListingFilter
          basePath="/tempat-makan"
          state={state}
          categories={categories}
          cities={cities}
          facilities={facilities}
        />
        <div>
          {result.items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="mb-2 text-lg font-semibold text-black">
                Belum ada tempat makan yang cocok.
              </p>
              <p className="mb-4 text-sm text-black/60">
                Coba ubah atau hapus beberapa filter pencarianmu.
              </p>
              <Link href="/tempat-makan" className="btn-primary">
                Reset filter
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            buildHref={buildPageHref}
          />
        </div>
      </div>
    </div>
  );
}
