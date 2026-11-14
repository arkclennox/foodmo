import { siteUrl } from '@/lib/seo';
import { prisma } from '@/lib/db';
import { THIN_CONTENT_THRESHOLDS } from '@/lib/constants';
import { urlsetXml, xmlResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 86400; // 1 hari

export async function GET() {
  const origin = siteUrl().replace(/\/$/, '');
  const cities = await prisma.city.findMany({
    where: { listings: { some: { status: 'published' } } },
    include: {
      _count: { select: { listings: { where: { status: 'published' } } } },
    },
  });
  const entries = cities
    .filter((c) => c._count.listings >= THIN_CONTENT_THRESHOLDS.cityMinListings)
    .map((c) => ({
      loc: `${origin}/kota/${c.slug}`,
      lastmod: c.updatedAt,
      changefreq: 'weekly' as const,
      priority: 0.7,
    }));
  return xmlResponse(urlsetXml(entries));
}
