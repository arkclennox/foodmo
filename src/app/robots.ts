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
        ],
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
