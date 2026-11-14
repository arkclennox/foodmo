import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Directory } from '@/components/Directory';
import { prisma } from '@/lib/db';
import { listCities, listFacilities, listListings } from '@/lib/queries';
import { DEFAULT_PAGE_SIZE, THIN_CONTENT_THRESHOLDS } from '@/lib/constants';
import { toCardData } from '@/lib/listing-index';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, jsonLdScript } from '@/lib/schema';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await prisma.category.findMany({
    select: { slug: true },
  });
  return items.map((item) => ({ slug: item.slug }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: { select: { listings: { where: { status: 'published' } } } },
    },
  });
  if (!category) return buildMetadata({ title: 'Kategori tidak ditemukan', noindex: true });
  const thin = category._count.listings < THIN_CONTENT_THRESHOLDS.categoryMinListings;
  return buildMetadata({
    title: category.metaTitle || `Kategori ${category.name}`,
    description:
      category.metaDescription ||
      category.description ||
      `Jelajahi tempat makan kategori ${category.name} di FoodMo.`,
    path: `/kategori/${category.slug}`,
    noindex: thin,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();


  const [cities, facilities, result, relatedArticles] = await Promise.all([
    listCities(),
    listFacilities(),
    listListings({ categorySlug: slug, sort: 'latest', page: 1, limit: DEFAULT_PAGE_SIZE }),
    prisma.article.findMany({
      where: { status: 'published', category: { slug } },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    }),
  ]);


  const breadcrumbs = breadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Kategori', url: '/kategori' },
    { name: category.name },
  ]);

  return (
    <div className="section py-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Kategori', href: '/kategori' },
          { label: category.name },
        ]}
      />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Kategori: {category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-3xl text-black/70">{category.description}</p>
        )}
      </header>
      <Directory
        options={{
          basePath: `/kategori/${slug}`,
          fixed: { category: slug },
          categories: [],
          cities: cities.map((c) => ({ slug: c.slug, name: c.name })),
          facilities,
          hideCategory: true,
        }}
        initial={{
          items: result.items.map(toCardData),
          total: result.total,
          totalPages: result.totalPages,
        }}
        pageSize={DEFAULT_PAGE_SIZE}
      />
      {relatedArticles.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-xl font-semibold text-black">
            Artikel terkait kategori
          </h2>
          <ul className="space-y-2">
            {relatedArticles.map((a) => (
              <li key={a.id}>
                <Link prefetch={false}
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
