import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { articleInputSchema } from '@/lib/validators';
import { createArticleFromInput } from '@/lib/article-service';

export async function GET() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { category: { select: { name: true, slug: true } } },
  });
  return apiSuccess(articles);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) {
    return ERR.validation('Data tidak valid', parsed.error.format());
  }
  try {
    const created = await createArticleFromInput(parsed.data);
    return apiSuccess(created, { status: 201 });
  } catch (err) {
    return ERR.validation(err instanceof Error ? err.message : 'Gagal membuat artikel');
  }
}
