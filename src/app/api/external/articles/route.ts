import { NextRequest } from 'next/server';
import { apiSuccess, ERR } from '@/lib/api-response';
import { authenticateApiKey } from '@/lib/api-key-guard';
import { articleInputSchema } from '@/lib/validators';
import { createArticleFromInput } from '@/lib/article-service';

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req, 'articles:create');
  if (!auth.ok) return auth.response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = articleInputSchema.safeParse(body);
  if (!parsed.success) return ERR.validation('Data tidak valid', parsed.error.format());
  try {
    const created = await createArticleFromInput(parsed.data);
    return apiSuccess(created, { status: 201 });
  } catch (err) {
    return ERR.validation(err instanceof Error ? err.message : 'Gagal membuat artikel');
  }
}
