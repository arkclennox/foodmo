import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { listListings } from '@/lib/queries';
import { parsePagination } from '@/lib/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const { page, limit } = parsePagination(sp, { limit: DEFAULT_PAGE_SIZE });
  const result = await listListings({
    search: sp.get('search') ?? undefined,
    categorySlug: sp.get('category') ?? undefined,
    citySlug: sp.get('city') ?? undefined,
    priceRange: sp.get('priceRange') ?? undefined,
    facility: sp.get('facility') ?? undefined,
    sort: (sp.get('sort') as 'latest' | 'rating' | 'name' | 'featured') ?? 'latest',
    page,
    limit,
  });
  return apiSuccess(result);
}
