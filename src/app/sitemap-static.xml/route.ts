import { siteUrl } from '@/lib/seo';
import { urlsetXml, xmlResponse, type UrlEntry } from '@/lib/sitemap-xml';

export const dynamic = 'force-static';
export const revalidate = 86400; // 1 hari

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

export async function GET() {
  const origin = siteUrl().replace(/\/$/, '');
  const now = new Date();
  const body = urlsetXml(
    STATIC_PAGES.map((p) => ({ ...p, loc: `${origin}${p.loc}`, lastmod: now })),
  );
  return xmlResponse(body);
}
