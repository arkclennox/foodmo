import Link from 'next/link';
import { prisma } from '@/lib/db';
import { EditIcon, PlusIcon } from '@/components/icons';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { ArticleBulkTable } from '@/components/admin/ArticleBulkTable';
import { Pagination } from '@/components/admin/Pagination';


export const dynamic = 'force-dynamic';

function oneOf(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = oneOf(sp.status);
  const search = oneOf(sp.search);
  const limitStr = oneOf(sp.limit);
  const pageStr = oneOf(sp.page);

  const limit = limitStr ? parseInt(limitStr, 10) : 50;
  const page = pageStr ? parseInt(pageStr, 10) : 1;
  const skip = (page - 1) * limit;


  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  const [total, articles, categories] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { category: { select: { name: true } } },
    }),
    prisma.category.findMany({ where: { type: 'article' }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);


  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Artikel</h1>
        <Link href="/admin/articles/new" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Tambah artikel
        </Link>
      </div>
      <form action="/admin/articles" className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-xl border border-border shadow-sm">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari judul atau slug…"
          className="input-base flex-1 min-w-[200px]"
        />
        <select name="status" defaultValue={status} className="input-base w-auto">
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <div className="flex items-center gap-2 text-sm text-black/60 sm:border-l sm:pl-3 sm:ml-1">
          <span>Tampilkan</span>
          <select name="limit" defaultValue={limit} className="input-base w-auto py-1">
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <button className="btn-secondary">Filter</button>
      </form>

      <ArticleBulkTable 
        articles={articles} 
        categories={categories} 
      />

      <Pagination total={total} limit={limit} page={page} />
    </div>
  );
}

function statusBadge(status: string): string {
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
