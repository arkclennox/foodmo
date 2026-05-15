import { prisma } from '@/lib/db';
import { siteUrl } from '@/lib/seo';
import { THIN_CONTENT_THRESHOLDS } from '@/lib/constants';
import { urlsetXml, xmlResponse } from '@/lib/sitemap-xml';

export const revalidate = 3600;

export async function GET() {
  const cities = await prisma.city.findMany({
    where: { listings: { some: { status: 'published' } } },
    include: {
      _count: { select: { listings: { where: { status: 'published' } } } },
    },
  });
  const entries = cities
    .filter((c) => c._count.listings >= THIN_CONTENT_THRESHOLDS.cityMinListings)
    .map((c) => ({
      loc: siteUrl(`/kota/${c.slug}`),
      lastmod: c.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));
  return xmlResponse(urlsetXml(entries));
}
