import { prisma } from './db';
import { parseJsonArray } from './json-fields';

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

export async function listListings(opts: ListingQueryOptions) {
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

export async function findListingBySlug(slug: string, includeDrafts = false) {
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

export async function listArticles(opts: {
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

export async function findArticleBySlug(slug: string, includeDrafts = false) {
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

export async function listCategories(type?: 'listing' | 'article') {
  return prisma.category.findMany({
    where: {
      type: type || undefined,
      ...(type === 'listing' ? { listings: { some: { status: 'published' } } } : {}),
      ...(type === 'article' ? { articles: { some: { status: 'published' } } } : {}),
    },
    orderBy: { name: 'asc' },
  });
}

export async function listCities() {
  return prisma.city.findMany({
    where: { listings: { some: { status: 'published' } } },
    orderBy: { name: 'asc' },
  });
}

export async function listFacilities() {
  const listings = await prisma.listing.findMany({
    where: { status: 'published' },
    select: { facilities: true },
  });
  const set = new Set<string>();
  for (const l of listings) {
    const arr = parseJsonArray<string>(l.facilities);
    for (const f of arr) {
      if (f.trim()) set.add(f.trim());
    }
  }
  return Array.from(set).sort();
}
