import { siteUrl } from '@/lib/seo';
import { indexXml, urlsetXml, xmlResponse, type UrlEntry } from '@/lib/sitemap-xml';

export const revalidate = 3600;

const STATIC_PAGES: UrlEntry[] = [
  { loc: '/', priority: 1, changefreq: 'weekly' },
  { loc: '/tempat-makan', priority: 0.9, changefreq: 'weekly' },
  { loc: '/kota', priority: 0.8, changefreq: 'weekly' },
  { loc: '/kategori', priority: 0.8, changefreq: 'weekly' },
  { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
  { loc: '/peta-situs', priority: 0.5, changefreq: 'monthly' },
  { loc: '/about', priority: 0.5, changefreq: 'yearly' },
  { loc: '/contact', priority: 0.5, changefreq: 'yearly' },
  { loc: '/editorial', priority: 0.5, changefreq: 'yearly' },
  { loc: '/koreksi-data', priority: 0.5, changefreq: 'yearly' },
  { loc: '/disclaimer', priority: 0.4, changefreq: 'yearly' },
  { loc: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { loc: '/terms-of-service', priority: 0.4, changefreq: 'yearly' },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  // If accessed as the static sitemap (no query), return the sitemap index
  // that lists all sub-sitemaps. The static URLs are embedded inline to
  // avoid an extra round-trip.
  if (url.searchParams.get('section') === 'static') {
    const body = urlsetXml(
      STATIC_PAGES.map((p) => ({ ...p, loc: siteUrl(p.loc), lastmod: new Date() })),
    );
    return xmlResponse(body);
  }

  const now = new Date();
  const body = indexXml([
    { loc: siteUrl('/sitemap.xml?section=static'), lastmod: now },
    { loc: siteUrl('/sitemap-cities.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-categories.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-listings.xml'), lastmod: now },
    { loc: siteUrl('/sitemap-articles.xml'), lastmod: now },
  ]);
  return xmlResponse(body);
}
