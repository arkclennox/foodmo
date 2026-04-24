import Link from 'next/link';
import { prisma } from '@/lib/db';
import { EditIcon, PlusIcon } from '@/components/icons';
import { DeleteButton } from '@/components/admin/DeleteButton';

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

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  const articles = await prisma.article.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Artikel</h1>
        <Link href="/admin/articles/new" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Tambah artikel
        </Link>
      </div>
      <form action="/admin/articles" className="grid gap-3 sm:grid-cols-[1fr,200px,auto]">
        <input
          name="search"
          defaultValue={search}
          placeholder="Cari judul atau slug…"
          className="input-base"
        />
        <select name="status" defaultValue={status} className="input-base">
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <button className="btn-secondary">Filter</button>
      </form>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-black/60">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-black/60">
                  Belum ada artikel.
                </td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-black">{a.title}</div>
                  <div className="text-xs text-black/50">/blog/{a.slug}</div>
                </td>
                <td className="px-4 py-3 text-black/70">{a.category?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={statusBadge(a.status)}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-black/70">
                  {a.publishedAt ? a.publishedAt.toLocaleDateString('id-ID') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="btn-secondary"
                    >
                      <EditIcon className="h-4 w-4" /> Edit
                    </Link>
                    <DeleteButton
                      endpoint={`/api/admin/articles/${a.id}`}
                      confirmText={`Hapus artikel "${a.title}"?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
