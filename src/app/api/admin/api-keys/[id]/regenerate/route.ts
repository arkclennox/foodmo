import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { generateApiKey } from '@/lib/api-key';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key) return ERR.notFound('API key tidak ditemukan');
  const { raw, hash, preview } = generateApiKey();
  const updated = await prisma.apiKey.update({
    where: { id },
    data: {
      keyHash: hash,
      keyPreview: preview,
      status: 'active',
      revokedAt: null,
      lastUsedAt: null,
    },
  });
  return apiSuccess({ key: raw, name: updated.name, id: updated.id });
}
