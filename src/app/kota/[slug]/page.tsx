import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Directory } from '@/components/Directory';
import { prisma } from '@/lib/db';
import { listCategories, listFacilities, listListings } from '@/lib/queries';
import { DEFAULT_PAGE_SIZE, THIN_CONTENT_THRESHOLDS } from '@/lib/constants';
import { toCardData } from '@/lib/listing-index';
import { buildMetadata } from '@/lib/seo';
import { breadcrumbSchema, jsonLdScript } from '@/lib/schema';

export const revalidate = 3600;
export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await prisma.city.findMany({
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
  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      _count: { select: { listings: { where: { status: 'published' } } } },
    },
  });
  if (!city) return buildMetadata({ title: 'Kota tidak ditemukan', noindex: true });
  const thin = city._count.listings < THIN_CONTENT_THRESHOLDS.cityMinListings;
  return buildMetadata({
    title: city.metaTitle || `Kuliner ${city.name}`,
    description:
      city.metaDescription ||
      city.description ||
      `Rekomendasi tempat makan, cafe, dan warung di ${city.name}.`,
    path: `/kota/${city.slug}`,
    noindex: thin,
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = await prisma.city.findUnique({ where: { slug } });
  if (!city) notFound();


  const [categories, facilities, result, popularCategories] = await Promise.all([
    listCategories('listing'),
    listFacilities(),
    listListings({ citySlug: slug, sort: 'latest', page: 1, limit: DEFAULT_PAGE_SIZE }),
    prisma.category.findMany({ where: { type: 'listing' }, take: 8, orderBy: { name: 'asc' } }),
  ]);


  const breadcrumbs = breadcrumbSchema([
    { name: 'Beranda', url: '/' },
    { name: 'Kota', url: '/kota' },
    { name: city.name },
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
          { label: 'Kota', href: '/kota' },
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
            <Link prefetch={false}
              key={c.slug}
              href={`/kategori/${c.slug}?city=${slug}`}
              className="badge-outline hover:border-navy hover:text-navy"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
      <Directory
        options={{
          basePath: `/kota/${slug}`,
          fixed: { city: slug },
          categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
          cities: [],
          facilities,
          hideCity: true,
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
