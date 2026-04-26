import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ListingCard } from '@/components/ListingCard';
import { ArticleCard } from '@/components/ArticleCard';
import { SearchBar, CategoryQuickLinks } from '@/components/SearchBar';
import { CTASection } from '@/components/CTASection';
import { BuildingIcon, SparklesIcon } from '@/components/icons';

export const revalidate = 60;

// Data is now fetched dynamically from the database

export default async function HomePage() {
  const [latestListings, featuredListings, latestArticles, stats, popularCategories, popularCities] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
      },
    }),
    prisma.listing.findMany({
      where: { status: 'published', isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
      },
    }),
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      include: { category: { select: { name: true, slug: true } } },
    }),
    Promise.all([
      prisma.listing.count({ where: { status: 'published' } }),
      prisma.city.count({ where: { listings: { some: { status: 'published' } } } }),
      prisma.category.count({ where: { type: 'listing', listings: { some: { status: 'published' } } } }),
    ]),
    prisma.category.findMany({
      where: { type: 'listing', listings: { some: { status: 'published' } } },
      orderBy: { listings: { _count: 'desc' } },
      take: 8,
    }),
    prisma.city.findMany({
      where: { listings: { some: { status: 'published' } } },
      orderBy: { listings: { _count: 'desc' } },
      take: 8,
    }),
  ]);

  const [listingCount, cityCount, categoryCount] = stats;
  const recommended = featuredListings;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-soft">
        <div className="section py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-3 py-1 text-xs font-medium text-navy">
              <SparklesIcon className="h-3.5 w-3.5" /> FoodMo Indonesia
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl lg:text-5xl">
              Temukan tempat makan <span className="text-navy">favoritmu</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-black/70 sm:text-lg">
              Direktori lengkap restoran, cafe, dan warung makan di seluruh
              Indonesia — dari bakso, mie ayam, hingga fine dining.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar size="lg" />
            <div className="mt-4 flex justify-center">
              <CategoryQuickLinks />
            </div>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-border bg-white px-4 py-3">
              <div className="text-2xl font-semibold text-navy">{listingCount}+</div>
              <div className="text-xs text-black/60">Tempat makan</div>
            </div>
            <div className="rounded-xl border border-border bg-white px-4 py-3">
              <div className="text-2xl font-semibold text-navy">{cityCount}+</div>
              <div className="text-xs text-black/60">Kota</div>
            </div>
            <div className="rounded-xl border border-border bg-white px-4 py-3">
              <div className="text-2xl font-semibold text-navy">{categoryCount}+</div>
              <div className="text-xs text-black/60">Kategori</div>
            </div>
          </div>
        </div>
      </section>

      {/* KATEGORI POPULER */}
      <section className="section py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-black">Kategori populer</h2>
            <p className="text-sm text-black/60">Mulai telusuri berdasarkan jenis tempat makan.</p>
          </div>
          <Link href="/tempat-makan" className="btn-ghost">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popularCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="card group flex items-center gap-3 p-4 transition hover:border-navy"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy group-hover:bg-navy group-hover:text-white">
                <BuildingIcon className="h-5 w-5" />
              </span>
              <span className="font-medium text-black group-hover:text-navy">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* KOTA POPULER */}
      <section className="section py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-black">Kota populer</h2>
          <p className="text-sm text-black/60">Eksplorasi kuliner dari berbagai kota Indonesia.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {popularCities.map((city) => (
            <Link
              key={city.slug}
              href={`/kota/${city.slug}`}
              className="card flex flex-col items-start gap-1 p-4 transition hover:border-navy"
            >
              <span className="text-xs uppercase tracking-wide text-black/50">Kota</span>
              <span className="text-lg font-semibold text-black">{city.name}</span>
              <span className="mt-1 text-xs font-medium text-navy">Lihat tempat makan →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* REKOMENDASI */}
      {recommended.length > 0 && (
        <section className="section py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-black">Rekomendasi untukmu</h2>
              <p className="text-sm text-black/60">Pilihan tempat makan pilihan dari direktori.</p>
            </div>
            <Link href="/tempat-makan" className="btn-ghost">
              Lihat semua
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* TERBARU */}
      {latestListings.length > 0 && (
        <section className="section py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-black">Tempat makan terbaru</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latestListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {/* BLOG */}
      {latestArticles.length > 0 && (
        <section className="section py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-black">Artikel kuliner terbaru</h2>
              <p className="text-sm text-black/60">Tips, rekomendasi, dan berita kuliner pilihan.</p>
            </div>
            <Link href="/blog" className="btn-ghost">
              Semua artikel
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <CTASection />
    </>
  );
}
