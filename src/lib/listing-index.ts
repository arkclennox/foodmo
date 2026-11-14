/**
 * Compact listing index for the static site.
 *
 * The public site is a static export, so directory search / filter / sort /
 * pagination run in the browser over this index (served as
 * /data/listings.json). Keep it small: only what ListingCard and the filters
 * need, with categories, cities and facilities stored once and referenced by
 * position.
 */
import type { ListingCardData } from '@/components/ListingCard';

// [name, slug, excerpt, address, image, rating, price, featured(0|1),
//  categoryIdx(-1 = none), cityIdx(-1 = none), facilityIdxs, createdAt(ms)]
export type IndexRow = [
  string, string, string, string, string | null, number, string | null, 0 | 1,
  number, number, number[], number,
];

export type ListingIndex = {
  categories: Array<[slug: string, name: string]>;
  cities: Array<[slug: string, name: string]>;
  facilities: string[];
  rows: IndexRow[];
};

export type DirectoryState = {
  search: string;
  category: string;
  city: string;
  price: string;
  facility: string;
  sort: string;
};

export const EXCERPT_CHARS = 120;

function rowToCard(index: ListingIndex, r: IndexRow): ListingCardData {
  const cat = r[8] >= 0 ? index.categories[r[8]] : null;
  const city = r[9] >= 0 ? index.cities[r[9]] : null;
  return {
    id: r[1],
    name: r[0],
    slug: r[1],
    shortDescription: r[2],
    description: '',
    address: r[3],
    featuredImageUrl: r[4],
    rating: r[5],
    priceRange: r[6],
    isFeatured: r[7] === 1,
    category: cat ? { slug: cat[0], name: cat[1] } : null,
    city: city ? { slug: city[0], name: city[1] } : null,
  };
}

/** Same filter + sort semantics as listListings() in lib/queries.ts. */
export function queryIndex(
  index: ListingIndex,
  state: DirectoryState,
  page: number,
  limit: number,
) {
  const catIdx = state.category ? index.categories.findIndex((c) => c[0] === state.category) : -2;
  const cityIdx = state.city ? index.cities.findIndex((c) => c[0] === state.city) : -2;
  const facIdx = state.facility ? index.facilities.indexOf(state.facility) : -2;
  const q = state.search.trim().toLocaleLowerCase('id-ID');

  let rows = index.rows.filter((r) => {
    if (catIdx !== -2 && r[8] !== catIdx) return false;
    if (cityIdx !== -2 && r[9] !== cityIdx) return false;
    if (state.price && r[6] !== state.price) return false;
    if (facIdx !== -2 && !r[10].includes(facIdx)) return false;
    if (q) {
      const hay = `${r[0]}\n${r[2]}\n${r[3]}`.toLocaleLowerCase('id-ID');
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const byLatest = (a: IndexRow, b: IndexRow) => b[11] - a[11];
  switch (state.sort) {
    case 'rating':
      rows = rows.sort((a, b) => b[5] - a[5] || byLatest(a, b));
      break;
    case 'name':
      rows = rows.sort((a, b) => a[0].localeCompare(b[0], 'id-ID'));
      break;
    case 'featured':
      rows = rows.sort((a, b) => b[7] - a[7] || byLatest(a, b));
      break;
    default:
      rows = rows.sort(byLatest);
  }

  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const items = rows.slice((page - 1) * limit, page * limit).map((r) => rowToCard(index, r));
  return { items, total, totalPages };
}

/** Trim a DB listing row down to what ListingCard renders (keeps RSC payload small). */
export function toCardData(l: {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  address: string;
  featuredImageUrl: string | null;
  rating: number;
  priceRange: string | null;
  isFeatured: boolean;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
}): ListingCardData {
  return {
    id: l.id,
    name: l.name,
    slug: l.slug,
    shortDescription: (l.shortDescription || l.description || '').slice(0, EXCERPT_CHARS),
    description: '',
    address: l.address,
    featuredImageUrl: l.featuredImageUrl,
    rating: l.rating,
    priceRange: l.priceRange,
    isFeatured: l.isFeatured,
    category: l.category,
    city: l.city,
  };
}
