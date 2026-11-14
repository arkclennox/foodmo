import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { BlogView } from '@/components/BlogView';
import { buildMetadata } from '@/lib/seo';
import { listCategories } from '@/lib/queries';
import { prisma } from '@/lib/db';

export const revalidate = 600;

export const metadata: Metadata = buildMetadata({
  title: 'Blog Kuliner',
  description:
    'Artikel dan berita kuliner terbaru — tips, rekomendasi, dan rangkuman tempat makan pilihan.',
  path: '/blog',
});

export default async function BlogIndexPage() {
  const [categories, articles] = await Promise.all([
    listCategories(),
    prisma.article.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImageUrl: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return (
    <div className="section py-8">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Blog' }]} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-black">Blog Kuliner</h1>
        <p className="mt-1 text-black/70">
          Artikel dan berita kuliner pilihan untuk menemani petualangan rasamu.
        </p>
      </header>
      <BlogView
        articles={articles.map((a) => ({ ...a, publishedAt: a.publishedAt?.toISOString() ?? null }))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        pageSize={9}
      />
    </div>
  );
}
