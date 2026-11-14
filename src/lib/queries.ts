import { prisma } from './db';
import { parseJsonArray } from './json-fields';
import { unstable_cache } from 'next/cache';

// Cache windows. Detail pages are long-lived and refreshed on demand from
// src/lib/revalidate.ts whenever admin/API writes happen. NOTE: Next.js uses
// the *shortest* revalidate of any cached query on a page, so a short value
// here would silently make every ISR page re-render that often.
const WEEK = 60 * 60 * 24 * 7;
const DAY = 60 * 60 * 24;
const HOUR = 60 * 60;

export type ListingQueryOptions = {
  search?: string;
  categorySlug?: string;
  citySlug?: string;
  priceRange?: string;
  facility?: string;
  sort?: 'latest' | 'rating' | 'name' | 'featured';
  page?: number;
  limit?: number;
  includeDrafts?: boolean;
};

async function listListingsUncached(opts: ListingQueryOptions) {
  const {
    search,
    categorySlug,
    citySlug,
    priceRange,
    facility,
    sort = 'latest',
    page = 1,
    limit = 12,
    includeDrafts = false,
  } = opts;

  const where: Record<string, unknown> = {};
  if (!includeDrafts) where.status = 'published';
  if (categorySlug) where.category = { slug: categorySlug };
  if (citySlug) where.city = { slug: citySlug };
  if (priceRange) where.priceRange = priceRange;
  if (facility) where.facilities = { contains: `"${facility}"` };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { shortDescription: { contains: search } },
      { address: { contains: search } },
    ];
  }

  let orderBy: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>;
  switch (sort) {
    case 'rating':
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'featured':
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
      include: {
        category: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

const cachedListListings = unstable_cache(
  (opts: ListingQueryOptions) => listListingsUncached(opts),
  ['list-listings'],
  { revalidate: HOUR, tags: ['listings', 'listings-list'] },
);

// "Related" cards on listing detail pages. Kept separate from the list cache
// so creating/editing one listing doesn't invalidate all ~5k detail pages.
const cachedRelatedListings = unstable_cache(
  (opts: ListingQueryOptions) => listListingsUncached(opts),
  ['related-listings'],
  { revalidate: WEEK, tags: ['listings'] },
);

export async function listRelatedListings(opts: ListingQueryOptions) {
  return cachedRelatedListings(opts);
}

export async function listListings(opts: ListingQueryOptions) {
  if (opts.includeDrafts) {
    return listListingsUncached(opts);
  }
  return cachedListListings(opts);
}

async function findListingBySlugUncached(slug: string, includeDrafts = false) {
  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      city: { select: { name: true, slug: true } },
    },
  });
  if (!listing) return null;
  if (!includeDrafts && listing.status !== 'published') return null;
  return {
    ...listing,
    facilitiesList: parseJsonArray<string>(listing.facilities),
    menuHighlightsList: parseJsonArray<string>(listing.menuHighlights),
    galleryImagesList: parseJsonArray<string>(listing.galleryImages),
  };
}

const cachedFindListingBySlug = (slug: string) =>
  unstable_cache(
    () => findListingBySlugUncached(slug, false),
    ['find-listing-by-slug', slug],
    { revalidate: WEEK, tags: ['listings', `listing:${slug}`] },
  )();

export async function findListingBySlug(slug: string, includeDrafts = false) {
  if (includeDrafts) {
    return findListingBySlugUncached(slug, true);
  }
  return cachedFindListingBySlug(slug);
}

async function listArticlesUncached(opts: {
  search?: string;
  categorySlug?: string;
  page?: number;
  limit?: number;
  includeDrafts?: boolean;
}) {
  const {
    search,
    categorySlug,
    page = 1,
    limit = 12,
    includeDrafts = false,
  } = opts;
  const where: Record<string, unknown> = {};
  if (!includeDrafts) where.status = 'published';
  if (categorySlug) where.category = { slug: categorySlug };
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { contentHtml: { contains: search } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: (page - 1) * limit,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.article.count({ where }),
  ]);
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

const cachedListArticles = unstable_cache(
  (opts: Parameters<typeof listArticlesUncached>[0]) => listArticlesUncached(opts),
  ['list-articles'],
  { revalidate: HOUR, tags: ['articles', 'articles-list'] },
);

export async function listArticles(opts: Parameters<typeof listArticlesUncached>[0]) {
  if (opts.includeDrafts) {
    return listArticlesUncached(opts);
  }
  return cachedListArticles(opts);
}

async function findArticleBySlugUncached(slug: string, includeDrafts = false) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!article) return null;
  if (!includeDrafts && article.status !== 'published') return null;
  const tags = parseJsonArray<string>(article.tags);
  const relatedListingIds = parseJsonArray<string>(article.relatedListingIds);
  const relatedListings = relatedListingIds.length
    ? await prisma.listing.findMany({
        where: { id: { in: relatedListingIds }, status: 'published' },
        include: {
          category: { select: { name: true, slug: true } },
          city: { select: { name: true, slug: true } },
        },
      })
    : [];
  return { ...article, tags, relatedListings };
}

const cachedFindArticleBySlug = (slug: string) =>
  unstable_cache(
    () => findArticleBySlugUncached(slug, false),
    ['find-article-by-slug', slug],
    { revalidate: WEEK, tags: ['articles', `article:${slug}`] },
  )();

export async function findArticleBySlug(slug: string, includeDrafts = false) {
  if (includeDrafts) {
    return findArticleBySlugUncached(slug, true);
  }
  return cachedFindArticleBySlug(slug);
}

export const listCategories = unstable_cache(
  async (type?: 'listing' | 'article') => {
    return prisma.category.findMany({
      where: {
        type: type || undefined,
        ...(type === 'listing' ? { listings: { some: { status: 'published' } } } : {}),
        ...(type === 'article' ? { articles: { some: { status: 'published' } } } : {}),
      },
      orderBy: { name: 'asc' },
    });
  },
  ['categories-list'],
  { revalidate: DAY, tags: ['categories'] }
);

export const listCities = unstable_cache(
  async () => {
    return prisma.city.findMany({
      where: { listings: { some: { status: 'published' } } },
      orderBy: { name: 'asc' },
    });
  },
  ['cities-list'],
  { revalidate: DAY, tags: ['cities'] }
);

export const listFacilities = unstable_cache(
  async () => {
    const rows = await prisma.listing.findMany({
      where: {
        status: 'published',
        facilities: { not: null },
      },
      select: { facilities: true },
    });
    const set = new Set<string>();
    for (const r of rows) {
      for (const f of parseJsonArray<string>(r.facilities)) {
        const v = f.trim();
        if (v) set.add(v);
      }
    }
    return Array.from(set).sort();
  },
  ['facilities-list'],
  { revalidate: DAY, tags: ['facilities', 'listings'] }
);

// --- HOMEPAGE CACHED QUERIES ---

export const getHomepageLatestListings = unstable_cache(
  async () => {
    return prisma.listing.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
      },
    });
  },
  ['homepage-latest-listings'],
  { revalidate: HOUR, tags: ['listings', 'listings-list'] }
);

export const getHomepageFeaturedListings = unstable_cache(
  async () => {
    return prisma.listing.findMany({
      where: { status: 'published', isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        city: { select: { name: true, slug: true } },
      },
    });
  },
  ['homepage-featured-listings'],
  { revalidate: HOUR, tags: ['listings', 'listings-list'] }
);

export const getHomepageLatestArticles = unstable_cache(
  async () => {
    return prisma.article.findMany({
      where: { status: 'published' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      include: { category: { select: { name: true, slug: true } } },
    });
  },
  ['homepage-latest-articles'],
  { revalidate: HOUR, tags: ['articles', 'articles-list'] }
);

export const getHomepageStats = unstable_cache(
  async () => {
    return Promise.all([
      prisma.listing.count({ where: { status: 'published' } }),
      prisma.city.count({ where: { listings: { some: { status: 'published' } } } }),
      prisma.category.count({ where: { type: 'listing', listings: { some: { status: 'published' } } } }),
    ]);
  },
  ['homepage-stats'],
  { revalidate: HOUR, tags: ['listings', 'listings-list', 'cities', 'categories'] }
);

export const getHomepagePopularCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { type: 'listing', listings: { some: { status: 'published' } } },
      orderBy: { listings: { _count: 'desc' } },
      take: 8,
    });
  },
  ['homepage-popular-categories'],
  { revalidate: HOUR, tags: ['categories', 'listings', 'listings-list'] }
);

export const getHomepagePopularCities = unstable_cache(
  async () => {
    return prisma.city.findMany({
      where: { listings: { some: { status: 'published' } } },
      orderBy: { listings: { _count: 'desc' } },
      take: 8,
    });
  },
  ['homepage-popular-cities'],
  { revalidate: HOUR, tags: ['cities', 'listings', 'listings-list'] }
);
