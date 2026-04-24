import Link from 'next/link';

export type ArticleCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: Date | null;
  category: { name: string; slug: string } | null;
};

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function ArticleCard({ article }: { article: ArticleCardData }) {
  const image =
    article.featuredImageUrl ||
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"><rect fill="%2301083C" width="400" height="225"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="22" fill="white">Blog Kuliner</text></svg>',
      );

  return (
    <article className="card group overflow-hidden transition hover:shadow-md">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={article.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-5">
          {article.category && (
            <span className="badge mb-2">{article.category.name}</span>
          )}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-black transition group-hover:text-navy">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="mb-3 line-clamp-2 text-sm text-black/70">
              {article.excerpt}
            </p>
          )}
          <div className="text-xs text-black/50">
            {formatDate(article.publishedAt)}
          </div>
        </div>
      </Link>
    </article>
  );
}
