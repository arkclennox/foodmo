import { siteUrl } from '@/lib/seo';
import { prisma } from '@/lib/db';
import { THIN_CONTENT_THRESHOLDS } from '@/lib/constants';
import { urlsetXml, xmlResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 86400; // 1 hari

export async function GET() {
  const origin = siteUrl().replace(/\/$/, '');
  const listings = await prisma.listing.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true, description: true, isFeatured: true },
  });
  const entries = listings
    .filter(
      (l) =>
        (l.description?.trim().length ?? 0) >=
        THIN_CONTENT_THRESHOLDS.listingDescriptionChars,
    )
    .map((l) => ({
      loc: `${origin}/tempat-makan/${l.slug}`,
      lastmod: l.updatedAt,
      changefreq: 'weekly' as const,
      priority: l.isFeatured ? 0.9 : 0.7,
    }));
  return xmlResponse(urlsetXml(entries));
}
