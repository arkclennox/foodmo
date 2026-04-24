import { apiSuccess, ERR } from '@/lib/api-response';
import { findArticleBySlug } from '@/lib/queries';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = await findArticleBySlug(slug);
  if (!article) return ERR.notFound('Artikel tidak ditemukan');
  return apiSuccess(article);
}
