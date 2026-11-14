import { siteUrl } from '@/lib/seo';
import { prisma } from '@/lib/db';
import { urlsetXml, xmlResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 86400; // 1 hari

export async function GET() {
  const origin = siteUrl().replace(/\/$/, '');
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
