import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';
import { siteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/tempat-makan',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
  ].map((path) => ({
    url: siteUrl(path || '/'),
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));

  const [listings, articles, categories, cities] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.city.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...staticPages,
    ...listings.map((l) => ({
      url: siteUrl(`/tempat-makan/${l.slug}`),
      lastModified: l.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: siteUrl(`/blog/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...categories.map((c) => ({
      url: siteUrl(`/kategori/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
    ...cities.map((c) => ({
      url: siteUrl(`/kota/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];
}
