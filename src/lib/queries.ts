import { prisma } from './db';
import { parseJsonArray } from './json-fields';
import { unstable_cache } from 'next/cache';

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
  { revalidate: 300, tags: ['listings'] },
);

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

const cachedFindListingBySlug = unstable_cache(
  (slug: string) => findListingBySlugUncached(slug, false),
  ['find-listing-by-slug'],
  { revalidate: 300, tags: ['listings'] },
);

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
  { revalidate: 300, tags: ['articles'] },
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

const cachedFindArticleBySlug = unstable_cache(
  (slug: string) => findArticleBySlugUncached(slug, false),
  ['find-article-by-slug'],
  { revalidate: 300, tags: ['articles'] },
);

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
  { revalidate: 3600, tags: ['categories'] }
);

export const listCities = unstable_cache(
  async () => {
    return prisma.city.findMany({
      where: { listings: { some: { status: 'published' } } },
      orderBy: { name: 'asc' },
    });
  },
  ['cities-list'],
  { revalidate: 3600, tags: ['cities'] }
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
  { revalidate: 86400, tags: ['facilities', 'listings'] }
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
  { revalidate: 1800, tags: ['listings'] }
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
  { revalidate: 1800, tags: ['listings'] }
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
  { revalidate: 1800, tags: ['articles'] }
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
  { revalidate: 3600, tags: ['listings', 'cities', 'categories'] }
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
  { revalidate: 3600, tags: ['categories', 'listings'] }
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
  { revalidate: 3600, tags: ['cities', 'listings'] }
);
