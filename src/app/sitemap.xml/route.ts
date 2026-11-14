import { siteUrl } from '@/lib/seo';
import { indexXml, xmlResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 86400; // 1 hari

export async function GET() {
  const origin = siteUrl().replace(/\/$/, '');
  const now = new Date();
  const body = indexXml([
    { loc: `${origin}/sitemap-static.xml`, lastmod: now },
    { loc: `${origin}/sitemap-cities.xml`, lastmod: now },
    { loc: `${origin}/sitemap-categories.xml`, lastmod: now },
    { loc: `${origin}/sitemap-listings.xml`, lastmod: now },
    { loc: `${origin}/sitemap-articles.xml`, lastmod: now },
  ]);
  return xmlResponse(body);
}
