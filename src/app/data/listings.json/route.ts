import { prisma } from '@/lib/db';
import { parseJsonArray } from '@/lib/json-fields';
import { EXCERPT_CHARS, type IndexRow, type ListingIndex } from '@/lib/listing-index';

// Emitted as /data/listings.json by the static export.
export const dynamic = 'force-static';

export async function GET() {
  const [categories, cities, listings] = await Promise.all([
    prisma.category.findMany({ where: { type: 'listing' }, select: { id: true, slug: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.city.findMany({ select: { id: true, slug: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.listing.findMany({
      where: { status: 'published' },
      select: {
        name: true, slug: true, shortDescription: true, description: true, address: true,
        featuredImageUrl: true, rating: true, priceRange: true, isFeatured: true,
        categoryId: true, cityId: true, facilities: true, createdAt: true,
      },
    }),
  ]);

  const catPos = new Map(categories.map((c, i) => [c.id, i]));
  const cityPos = new Map(cities.map((c, i) => [c.id, i]));
  const facilities: string[] = [];
  const facPos = new Map<string, number>();

  const rows: IndexRow[] = listings.map((l) => {
    const facs = parseJsonArray<string>(l.facilities)
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => {
        let i = facPos.get(f);
        if (i === undefined) {
          i = facilities.push(f) - 1;
          facPos.set(f, i);
        }
        return i;
      });
    const excerpt = (l.shortDescription || l.description || '').slice(0, EXCERPT_CHARS);
    return [
      l.name, l.slug, excerpt, l.address, l.featuredImageUrl, l.rating, l.priceRange,
      l.isFeatured ? 1 : 0,
      l.categoryId ? catPos.get(l.categoryId) ?? -1 : -1,
      l.cityId ? cityPos.get(l.cityId) ?? -1 : -1,
      facs, l.createdAt.getTime(),
    ];
  });

  const body: ListingIndex = {
    categories: categories.map((c) => [c.slug, c.name]),
    cities: cities.map((c) => [c.slug, c.name]),
    facilities,
    rows,
  };
  return Response.json(body);
}
