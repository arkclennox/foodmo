import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { articlePatchSchema } from '@/lib/validators';
import { updateArticleFromInput } from '@/lib/article-service';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return ERR.notFound('Artikel tidak ditemukan');
  return apiSuccess(article);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = articlePatchSchema.safeParse(body);
  if (!parsed.success) {
    return ERR.validation('Data tidak valid', parsed.error.format());
  }
  try {
    const updated = await updateArticleFromInput(id, parsed.data);
    return apiSuccess(updated);
  } catch (err) {
    return ERR.validation(err instanceof Error ? err.message : 'Gagal update artikel');
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return ERR.notFound('Artikel tidak ditemukan');
  await prisma.article.delete({ where: { id } });
  return apiSuccess({ ok: true });
}
