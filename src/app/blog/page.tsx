import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { buildMetadata } from '@/lib/seo';
import { listArticles, listCategories } from '@/lib/queries';
import { parsePagination } from '@/lib/pagination';

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title: 'Blog Kuliner',
  description:
    'Artikel dan berita kuliner terbaru — tips, rekomendasi, dan rangkuman tempat makan pilihan.',
  path: '/blog',
});

function oneOf(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const search = oneOf(sp.search);
  const category = oneOf(sp.category);
  const { page, limit } = parsePagination(sp, { limit: 9 });

  const [categories, result] = await Promise.all([
    listCategories(),
    listArticles({ search, categorySlug: category, page, limit }),
  ]);

  const buildPageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/blog?${s}` : '/blog';
  };

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Blog' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Blog Kuliner</h1>
        <p className="mt-1 text-black/70">
          Artikel dan berita kuliner pilihan untuk menemani petualangan rasamu.
        </p>
      </header>

      <form
        action="/blog"
        method="get"
        className="mb-6 grid gap-3 sm:grid-cols-[1fr,220px,auto]"
      >
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari artikel…"
          className="input-base"
        />
        <select name="category" defaultValue={category} className="input-base">
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn-primary">Cari</button>
      </form>

      {result.items.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="mb-3 text-black/70">Belum ada artikel yang cocok dengan pencarianmu.</p>
          <Link href="/blog" className="btn-secondary">
            Lihat semua artikel
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        buildHref={buildPageHref}
      />
    </div>
  );
}
