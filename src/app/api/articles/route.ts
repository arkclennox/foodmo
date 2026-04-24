import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { listArticles } from '@/lib/queries';
import { parsePagination } from '@/lib/pagination';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const { page, limit } = parsePagination(sp, { limit: 10 });
  const result = await listArticles({
    search: sp.get('search') ?? undefined,
    categorySlug: sp.get('category') ?? undefined,
    page,
    limit,
  });
  return apiSuccess(result);
}
