import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ListingCard } from '@/components/ListingCard';
import { ListingFilter } from '@/components/ListingFilter';
import { Pagination } from '@/components/Pagination';
import { prisma } from '@/lib/db';
import { listCategories, listListings } from '@/lib/queries';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { parsePagination } from '@/lib/pagination';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await prisma.city.findMany({
    select: { slug: true },
  });
  return items.map((item) => ({ slug: item.slug }));
}


function oneOf(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) return buildMetadata({ title: 'Kota tidak ditemukan' });
  return buildMetadata({
    title: city.metaTitle || `Kuliner ${city.name}`,
    description:
      city.metaDescription ||
      city.description ||
      `Rekomendasi tempat makan, cafe, dan warung di ${city.name}.`,
    path: `/kota/${city.slug}`,
  });
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) notFound();

  const state = {
    search: oneOf(sp.search),
    category: oneOf(sp.category),
    city: slug,
    price: oneOf(sp.price),
    facility: oneOf(sp.facility),
    sort: oneOf(sp.sort) || 'latest',
  };
  const { page, limit } = parsePagination(sp, { limit: DEFAULT_PAGE_SIZE });

  const [categories, result, popularCategories] = await Promise.all([
    listCategories('listing'),
    listListings({
      search: state.search,
      categorySlug: state.category,
      citySlug: slug,
      priceRange: state.price,
      facility: state.facility,
      sort: state.sort as 'latest' | 'rating' | 'name' | 'featured',
      page,
      limit,
    }),
    prisma.category.findMany({ where: { type: 'listing' }, take: 8, orderBy: { name: 'asc' } }),
  ]);

  const buildPageHref = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v && k !== 'city') qs.set(k, String(v));
    });
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/kota/${slug}?${s}` : `/kota/${slug}`;
  };

  return (
    <div className="section py-8">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Kota' },
          { label: city.name },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-black">
          Kuliner {city.name}
          {city.province ? `, ${city.province}` : ''}
        </h1>
        {city.description && (
          <p className="mt-2 max-w-3xl text-black/70">{city.description}</p>
        )}
      </header>
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold text-black">
          Kategori populer di {city.name}
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}?city=${slug}`}
              className="badge-outline hover:border-navy hover:text-navy"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <ListingFilter
          basePath={`/kota/${slug}`}
          state={state}
          categories={categories}
          cities={[]}
          hideCity
        />
        <div>
          {result.items.length === 0 ? (
            <div className="card px-6 py-16 text-center">
              <p className="text-black/70">Belum ada tempat makan di {city.name}.</p>
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
