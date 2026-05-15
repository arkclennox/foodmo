import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { unstable_cache } from 'next/cache';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Jelajahi Berdasarkan Kategori',
  description:
    'Telusuri tempat makan di Indonesia berdasarkan kategori — restoran, cafe, warung makan, bakso, mie ayam, kopi, dan banyak lagi.',
  path: '/kategori',
});

const getCategoriesWithCount = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { type: 'listing', listings: { some: { status: 'published' } } },
      include: {
        _count: { select: { listings: { where: { status: 'published' } } } },
      },
      orderBy: { name: 'asc' },
    });
  },
  ['kategori-index'],
  { revalidate: 3600, tags: ['categories', 'listings'] },
);

export default async function KategoriIndexPage() {
  const categories = await getCategoriesWithCount();
  const totalCategories = categories.length;
  const totalListings = categories.reduce((sum, c) => sum + c._count.listings, 0);

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kategori' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Jelajahi Berdasarkan Kategori</h1>
        <p className="mt-2 max-w-3xl text-black/70">
          Pilih kategori tempat makan yang sedang kamu cari — mulai dari warung legendaris,
          cafe nyaman untuk kerja, hingga restoran untuk acara keluarga.
        </p>
        <p className="mt-1 text-sm text-black/60">
          {totalCategories} kategori · {totalListings.toLocaleString('id-ID')} tempat makan
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="text-black/70">
            Belum ada kategori yang aktif. Cek kembali sebentar lagi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="card flex flex-col gap-1 p-4 transition hover:border-navy"
            >
              <span className="text-xs uppercase tracking-wide text-black/50">Kategori</span>
              <span className="text-base font-semibold text-black">{c.name}</span>
              <span className="text-xs text-black/60">
                {c._count.listings.toLocaleString('id-ID')} tempat makan
              </span>
              {c.description && (
                <span className="mt-1 line-clamp-2 text-xs text-black/60">{c.description}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
