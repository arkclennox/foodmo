import { indexXml, xmlResponse } from '@/lib/sitemap-xml';

export const revalidate = 3600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
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
