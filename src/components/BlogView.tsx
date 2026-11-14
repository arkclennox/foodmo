'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArticleCard, type ArticleCardData } from './ArticleCard';
import { Pagination } from './Pagination';

type Option = { slug: string; name: string };
type Props = { articles: ArticleCardData[]; categories: Option[]; pageSize: number };

function BlogLayout({
  articles,
  categories,
  pageSize,
  search,
  category,
  page,
}: Props & { search: string; category: string; page: number }) {
  const q = search.trim().toLocaleLowerCase('id-ID');
  const filtered = articles.filter((a) => {
    if (category && a.category?.slug !== category) return false;
    if (q && !`${a.title}\n${a.excerpt ?? ''}`.toLocaleLowerCase('id-ID').includes(q)) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  const buildHref = (p: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    if (p > 1) qs.set('page', String(p));
    const s = qs.toString();
    return s ? `/blog?${s}` : '/blog';
  };

  return (
    <>
      <form
        key={`${search}|${category}`}
        action="/blog"
        method="get"
        className="mb-6 grid gap-3 sm:grid-cols-[1fr,220px,auto]"
      >
        <input name="search" defaultValue={search} placeholder="Cari artikel…" className="input-base" />
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

      {items.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="mb-3 text-black/70">Belum ada artikel yang cocok dengan pencarianmu.</p>
          <Link prefetch={false} href="/blog" className="btn-secondary">
            Lihat semua artikel
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </>
  );
}

function BlogFromUrl(props: Props) {
  const sp = useSearchParams();
  const raw = Number(sp.get('page'));
  const page = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  return (
    <BlogLayout
      {...props}
      search={sp.get('search') ?? ''}
      category={sp.get('category') ?? ''}
      page={page}
    />
  );
}

/** Blog list for the static site: all published cards are in the page; filtering runs in the browser. */
export function BlogView(props: Props) {
  return (
    <Suspense fallback={<BlogLayout {...props} search="" category="" page={1} />}>
      <BlogFromUrl {...props} />
    </Suspense>
  );
}
