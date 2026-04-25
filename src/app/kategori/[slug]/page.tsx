import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ListingCard } from '@/components/ListingCard';
import { ListingFilter } from '@/components/ListingFilter';
import { Pagination } from '@/components/Pagination';
import { prisma } from '@/lib/db';
import { listCities, listListings } from '@/lib/queries';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { parsePagination } from '@/lib/pagination';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 60;

export async function generateStaticParams() {
  const items = await prisma.category.findMany({
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
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return buildMetadata({ title: 'Kategori tidak ditemukan' });
  return buildMetadata({
    title: category.metaTitle || `Kategori ${category.name}`,
    description:
      category.metaDescription ||
      category.description ||
      `Jelajahi tempat makan kategori ${category.name} di FoodMo.`,

    path: `/kategori/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const state = {
    search: oneOf(sp.search),
    category: slug,
    city: oneOf(sp.city),
    price: oneOf(sp.price),
    facility: oneOf(sp.facility),
    sort: oneOf(sp.sort) || 'latest',
  };
  const { page, limit } = parsePagination(sp, { limit: DEFAULT_PAGE_SIZE });

  const [cities, result, relatedArticles] = await Promise.all([
    listCities(),
    listListings({
      search: state.search,
      categorySlug: slug,
      citySlug: state.city,
      priceRange: state.price,
      facility: state.facility,
      sort: state.sort as 'latest' | 'rating' | 'name' | 'featured',
      page,
      limit,
    }),
    prisma.article.findMany({
      where: { status: 'published', category: { slug } },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    }),
  ]);

  const buildPageHref = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(state).forEach(([k, v]) => {
      if (v && k !== 'category') qs.set(k, String(v));
    });
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/kategori/${slug}?${s}` : `/kategori/${slug}`;
  };

  return (
    <div className="section py-8">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Kategori' },
          { label: category.name },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Kategori: {category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-3xl text-black/70">{category.description}</p>
        )}
      </header>
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <ListingFilter
          basePath={`/kategori/${slug}`}
          state={state}
          categories={[]}
          cities={cities}
          hideCategory
        />
        <div>
          {result.items.length === 0 ? (
            <div className="card px-6 py-16 text-center">
              <p className="text-black/70">Belum ada tempat makan pada kategori ini.</p>
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
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold text-black">
            Artikel terkait kategori
          </h2>
          <ul className="space-y-2">
            {relatedArticles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition hover:border-navy"
                >
                  <span className="font-medium text-black">{a.title}</span>
                  <span className="text-sm text-navy">Baca →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
