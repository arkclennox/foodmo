import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { ArticleForm, type ArticleFormData } from '@/components/admin/ArticleForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { parseJsonArray } from '@/lib/json-fields';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories, listings] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
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
  if (!article) notFound();

  const initial: ArticleFormData = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? '',
    contentHtml: article.contentHtml,
    contentMarkdown: article.contentMarkdown ?? '',
    featuredImageUrl: article.featuredImageUrl ?? '',
    categoryId: article.categoryId ?? '',
    tags: parseJsonArray<string>(article.tags),
    relatedListingIds: parseJsonArray<string>(article.relatedListingIds),
    authorName: article.authorName ?? '',
    status: article.status,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString().slice(0, 10) : '',
    metaTitle: article.metaTitle ?? '',
    metaDescription: article.metaDescription ?? '',
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-black">Edit Artikel</h1>
        <div className="flex gap-2">
          <Link href={`/blog/${article.slug}`} target="_blank" className="btn-ghost">
            Lihat publik
          </Link>
          <DeleteButton
            endpoint={`/api/admin/articles/${article.id}`}
            confirmText={`Hapus artikel "${article.title}"?`}
            redirectTo="/admin/articles"
          />
        </div>
      </div>
      <ArticleForm
        initial={initial}
        categories={categories}
        listings={listings}
        articleId={article.id}
      />
    </div>
  );
}
