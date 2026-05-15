import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ArticleCard } from '@/components/ArticleCard';
import { ListingCard } from '@/components/ListingCard';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { findArticleBySlug, listArticles } from '@/lib/queries';
import { prisma } from '@/lib/db';


export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const items = await prisma.article.findMany({
    where: { status: 'published' },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 30,
    select: { slug: true },
  });
  return items.map((item) => ({ slug: item.slug }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticleBySlug(slug);
  if (!article) return buildMetadata({ title: 'Artikel tidak ditemukan' });
  return buildMetadata({
    title: article.metaTitle || article.title,
    description:
      article.metaDescription ||
      article.excerpt ||
      article.contentHtml.replace(/<[^>]+>/g, '').slice(0, 160),
    path: `/blog/${article.slug}`,
    image: article.featuredImageUrl || undefined,
    type: 'article',
  });
}

function toIsoString(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function formatDate(value: Date | string | null): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await findArticleBySlug(slug);
  if (!article) notFound();

  const related = await listArticles({
    categorySlug: article.category?.slug,
    limit: 4,
  });
  const relatedItems = related.items.filter((a) => a.id !== article.id).slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.featuredImageUrl || undefined,
    datePublished: toIsoString(article.publishedAt ?? article.createdAt),
    dateModified: toIsoString(article.updatedAt),
    author: article.authorName
      ? { '@type': 'Person', name: article.authorName }
      : undefined,
    mainEntityOfPage: siteUrl(`/blog/${article.slug}`),
  };

  return (
    <div className="section py-8">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: article.title },
        ]}
      />
      <article className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {article.category && (
            <Link href={`/blog?category=${article.category.slug}`} className="badge">
              {article.category.name}
            </Link>
          )}
          <span className="text-sm text-black/60">
            {formatDate(article.publishedAt)}
          </span>
          {article.authorName && (
            <span className="text-sm text-black/60">· Oleh {article.authorName}</span>
          )}
        </div>
        <h1 className="text-3xl font-semibold text-black sm:text-4xl">{article.title}</h1>
        {article.excerpt && (
          <p className="mt-3 text-lg text-black/70">{article.excerpt}</p>
        )}
        {article.featuredImageUrl && (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image
              src={article.featuredImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover"
              priority
            />
          </div>
        )}
        <div
          className="prose prose-navy mt-8 max-w-none text-black/85"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span key={t} className="badge-outline">
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>

      {article.relatedListings.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-black">Tempat makan yang dibahas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {article.relatedListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      {relatedItems.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-black">Artikel lainnya</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}
