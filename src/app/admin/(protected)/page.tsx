import Link from 'next/link';
import { prisma } from '@/lib/db';
import { PlusIcon } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [
    listingCount,
    articleCount,
    categoryCount,
    cityCount,
    listingDraftCount,
    articleDraftCount,
    latestListings,
    latestArticles,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.article.count(),
    prisma.category.count(),
    prisma.city.count(),
    prisma.listing.count({ where: { status: 'draft' } }),
    prisma.article.count({ where: { status: 'draft' } }),
    prisma.listing.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
      },
    }),
    prisma.article.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
  ]);

  const stats = [
    { label: 'Total Listing', value: listingCount, href: '/admin/listings' },
    { label: 'Total Artikel', value: articleCount, href: '/admin/articles' },
    { label: 'Total Kategori', value: categoryCount, href: '/admin/categories' },
    { label: 'Total Kota', value: cityCount, href: '/admin/cities' },
    { label: 'Listing Draft', value: listingDraftCount, href: '/admin/listings?status=draft' },
    { label: 'Artikel Draft', value: articleDraftCount, href: '/admin/articles?status=draft' },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">Overview</h1>
          <div className="flex gap-2">
            <Link href="/admin/listings/new" className="btn-primary">
              <PlusIcon className="h-4 w-4" /> Listing baru
            </Link>
            <Link href="/admin/articles/new" className="btn-secondary">
              <PlusIcon className="h-4 w-4" /> Artikel baru
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="card p-5 transition hover:border-navy">
              <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                {s.label}
              </div>
              <div className="mt-2 text-3xl font-semibold text-black">{s.value}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="font-semibold text-black">Listing terbaru</h2>
            <Link href="/admin/listings" className="text-sm text-navy hover:underline">
              Lihat semua
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {latestListings.length === 0 && (
              <li className="px-5 py-4 text-sm text-black/60">Belum ada listing.</li>
            )}
            {latestListings.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/listings/${l.id}/edit`}
                    className="line-clamp-1 font-medium text-black hover:text-navy"
                  >
                    {l.name}
                  </Link>
                  <div className="text-xs text-black/50">
                    {l.category?.name ?? '—'} · {l.city?.name ?? '—'}
                  </div>
                </div>
                <span className={badgeClass(l.status)}>{l.status}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="font-semibold text-black">Artikel terbaru</h2>
            <Link href="/admin/articles" className="text-sm text-navy hover:underline">
              Lihat semua
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {latestArticles.length === 0 && (
              <li className="px-5 py-4 text-sm text-black/60">Belum ada artikel.</li>
            )}
            {latestArticles.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <Link
                  href={`/admin/articles/${a.id}/edit`}
                  className="line-clamp-1 font-medium text-black hover:text-navy"
                >
                  {a.title}
                </Link>
                <span className={badgeClass(a.status)}>{a.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function badgeClass(status: string): string {
  switch (status) {
    case 'published':
      return 'rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700';
    case 'draft':
      return 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700';
    case 'archived':
      return 'rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700';
    default:
      return 'badge-outline';
  }
}
