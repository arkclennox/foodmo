import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { prisma } from '@/lib/db';
import { buildMetadata } from '@/lib/seo';
import { unstable_cache } from 'next/cache';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Jelajahi Berdasarkan Kota',
  description:
    'Daftar lengkap kota tempat FoodMo mengkurasi rekomendasi tempat makan — Jakarta, Bandung, Surabaya, Yogyakarta, Bali, dan lainnya.',
  path: '/kota',
});

const getCitiesWithCount = unstable_cache(
  async () => {
    return prisma.city.findMany({
      where: { listings: { some: { status: 'published' } } },
      include: {
        _count: { select: { listings: { where: { status: 'published' } } } },
      },
      orderBy: { name: 'asc' },
    });
  },
  ['kota-index'],
  { revalidate: 3600, tags: ['cities', 'listings'] },
);

function groupByProvince(
  cities: { name: string; slug: string; province: string | null; _count: { listings: number } }[],
) {
  const groups = new Map<string, typeof cities>();
  for (const c of cities) {
    const key = c.province?.trim() || 'Lainnya';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default async function KotaIndexPage() {
  const cities = await getCitiesWithCount();
  const totalCities = cities.length;
  const totalListings = cities.reduce((sum, c) => sum + c._count.listings, 0);
  const grouped = groupByProvince(cities);

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kota' }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Jelajahi Berdasarkan Kota</h1>
        <p className="mt-2 max-w-3xl text-black/70">
          FoodMo mengkurasi tempat makan, cafe, dan warung dari berbagai kota di Indonesia.
          Pilih kota di bawah untuk melihat rekomendasi yang sudah diverifikasi tim editorial
          kami.
        </p>
        <p className="mt-1 text-sm text-black/60">
          {totalCities} kota · {totalListings.toLocaleString('id-ID')} tempat makan
        </p>
      </header>

      {grouped.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="text-black/70">
            Belum ada kota yang aktif. Cek kembali sebentar lagi.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([province, list]) => (
            <section key={province}>
              <h2 className="mb-3 text-lg font-semibold text-black">{province}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/kota/${c.slug}`}
                    className="card flex flex-col gap-1 p-4 transition hover:border-navy"
                  >
                    <span className="text-xs uppercase tracking-wide text-black/50">Kota</span>
                    <span className="text-base font-semibold text-black">{c.name}</span>
                    <span className="text-xs text-black/60">
                      {c._count.listings.toLocaleString('id-ID')} tempat makan
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
