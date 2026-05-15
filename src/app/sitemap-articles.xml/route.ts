import { prisma } from '@/lib/db';
import { urlsetXml, xmlResponse } from '@/lib/sitemap-xml';

export const revalidate = 3600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });
  const entries = articles.map((a) => ({
    loc: `${origin}/blog/${a.slug}`,
    lastmod: a.updatedAt,
    changefreq: 'monthly' as const,
    priority: 0.7,
  }));
  return xmlResponse(urlsetXml(entries));
}
