import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api-response';
import { listCategories } from '@/lib/queries';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  const categories = await listCategories(
    type === 'article' || type === 'listing' ? type : undefined,
  );
  return apiSuccess(categories);
}
