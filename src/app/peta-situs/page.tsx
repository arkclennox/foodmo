import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { unstable_cache } from 'next/cache';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Peta Situs',
  description:
    'Daftar lengkap halaman penting di FoodMo — kota, kategori, artikel, dan halaman trust seperti kebijakan privasi & pedoman editorial.',
  path: '/peta-situs',
});

const getSitemapData = unstable_cache(
  async () => {
    const [cities, categories, latestArticles, featuredListings] = await Promise.all([
      prisma.city.findMany({
        where: { listings: { some: { status: 'published' } } },
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.category.findMany({
        where: { type: 'listing', listings: { some: { status: 'published' } } },
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      prisma.article.findMany({
        where: { status: 'published' },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: 30,
        select: { title: true, slug: true },
      }),
      prisma.listing.findMany({
        where: { status: 'published', isFeatured: true },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { name: true, slug: true },
      }),
    ]);
    return { cities, categories, latestArticles, featuredListings };
  },
  ['peta-situs-data'],
  { revalidate: 3600, tags: ['cities', 'categories', 'listings', 'articles'] },
);

export default async function PetaSitusPage() {
  const { cities, categories, latestArticles, featuredListings } = await getSitemapData();

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Peta Situs' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Peta Situs</h1>
        <p className="mt-2 max-w-3xl text-black/70">
          Daftar halaman penting di FoodMo. Untuk peta situs XML mesin pencari, lihat{' '}
          <a href="/sitemap.xml" className="text-navy hover:underline">
            /sitemap.xml
          </a>
          .
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">Halaman Utama</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/" className="text-navy hover:underline">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/tempat-makan" className="text-navy hover:underline">
                Direktori Tempat Makan
              </Link>
            </li>
            <li>
              <Link href="/kota" className="text-navy hover:underline">
                Jelajahi Kota
              </Link>
            </li>
            <li>
              <Link href="/kategori" className="text-navy hover:underline">
                Jelajahi Kategori
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-navy hover:underline">
                Blog Kuliner
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">Tentang & Kebijakan</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/about" className="text-navy hover:underline">
                Tentang FoodMo
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-navy hover:underline">
                Kontak
              </Link>
            </li>
            <li>
              <Link href="/editorial" className="text-navy hover:underline">
                Pedoman Editorial
              </Link>
            </li>
            <li>
              <Link href="/koreksi-data" className="text-navy hover:underline">
                Kebijakan Koreksi Data
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="text-navy hover:underline">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="text-navy hover:underline">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="text-navy hover:underline">
                Syarat &amp; Ketentuan
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">
            Kota ({cities.length})
          </h2>
          {cities.length === 0 ? (
            <p className="text-sm text-black/60">Belum ada kota dengan listing aktif.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kota/${c.slug}`} className="text-navy hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">
            Kategori ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <p className="text-sm text-black/60">Belum ada kategori dengan listing aktif.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kategori/${c.slug}`} className="text-navy hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">Tempat Makan Pilihan</h2>
          {featuredListings.length === 0 ? (
            <p className="text-sm text-black/60">Belum ada tempat makan pilihan.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {featuredListings.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/tempat-makan/${l.slug}`}
                    className="text-navy hover:underline"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm">
            <Link href="/tempat-makan" className="text-navy hover:underline">
              Lihat semua tempat makan →
            </Link>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-black">Artikel Terbaru</h2>
          {latestArticles.length === 0 ? (
            <p className="text-sm text-black/60">Belum ada artikel.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {latestArticles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="text-navy hover:underline">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm">
            <Link href="/blog" className="text-navy hover:underline">
              Lihat semua artikel →
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
