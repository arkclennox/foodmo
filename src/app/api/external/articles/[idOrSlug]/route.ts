import { NextRequest } from 'next/server';
import { apiSuccess, ERR } from '@/lib/api-response';
import { authenticateApiKey } from '@/lib/api-key-guard';
import { articlePatchSchema } from '@/lib/validators';
import { updateArticleFromInput } from '@/lib/article-service';

type Ctx = { params: Promise<{ idOrSlug: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await authenticateApiKey(req, 'articles:update');
  if (!auth.ok) return auth.response;
  const { idOrSlug } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = articlePatchSchema.safeParse(body);
  if (!parsed.success) return ERR.validation('Data tidak valid', parsed.error.format());
  try {
    const updated = await updateArticleFromInput(idOrSlug, parsed.data);
    return apiSuccess(updated);
  } catch (err) {
    return ERR.validation(err instanceof Error ? err.message : 'Gagal update artikel');
  }
}
