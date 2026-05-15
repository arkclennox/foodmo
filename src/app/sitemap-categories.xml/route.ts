import { prisma } from '@/lib/db';
import { THIN_CONTENT_THRESHOLDS } from '@/lib/constants';
import { urlsetXml, xmlResponse } from '@/lib/sitemap-xml';

export const revalidate = 3600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const categories = await prisma.category.findMany({
    where: { type: 'listing', listings: { some: { status: 'published' } } },
    include: {
      _count: { select: { listings: { where: { status: 'published' } } } },
    },
  });
  const entries = categories
    .filter((c) => c._count.listings >= THIN_CONTENT_THRESHOLDS.categoryMinListings)
    .map((c) => ({
      loc: `${origin}/kategori/${c.slug}`,
      lastmod: c.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));
  return xmlResponse(urlsetXml(entries));
}
