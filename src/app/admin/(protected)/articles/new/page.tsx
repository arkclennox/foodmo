import { prisma } from '@/lib/db';
import { ArticleForm, emptyArticleForm } from '@/components/admin/ArticleForm';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const [categories, listings] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.listing.findMany({
      where: { status: 'published' },
      orderBy: { name: 'asc' },
      take: 200,
      select: { id: true, name: true, slug: true },
    }),
  ]);
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-black">Tambah Artikel</h1>
      <ArticleForm initial={emptyArticleForm} categories={categories} listings={listings} />
    </div>
  );
}
