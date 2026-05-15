import { urlsetXml, xmlResponse, type UrlEntry } from '@/lib/sitemap-xml';

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
  const origin = `${url.protocol}//${url.host}`;
  const now = new Date();
  const body = urlsetXml(
    STATIC_PAGES.map((p) => ({ ...p, loc: `${origin}${p.loc}`, lastmod: now })),
  );
  return xmlResponse(body);
}
