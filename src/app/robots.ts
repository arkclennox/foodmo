import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/admin',
          '/api/admin/*',
          '/api/*',
          // Filter/sort/search combinations: noindex already, and each one is
          // a fresh server render (no ISR cache). Keep crawlers out of the
          // near-infinite facet space; plain `?page=` stays crawlable.
          '/*?*search=',
          '/*?*category=',
          '/*?*city=',
          '/*?*price=',
          '/*?*facility=',
          '/*?*sort=',
        ],
      },
      {
        // SEO-tool crawlers bring no visitors but crawl every URL repeatedly,
        // burning Vercel function/ISR quota.
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'DataForSeoBot',
          'serpstatbot',
          'Barkrowler',
          'MegaIndex.ru',
          'PetalBot',
          'Bytespider',
        ],
        disallow: '/',
      },
    ],
    sitemap: [
      siteUrl('/sitemap.xml'),
      siteUrl('/sitemap-cities.xml'),
      siteUrl('/sitemap-categories.xml'),
      siteUrl('/sitemap-listings.xml'),
      siteUrl('/sitemap-articles.xml'),
    ],
    host: siteUrl(),
  };
}
