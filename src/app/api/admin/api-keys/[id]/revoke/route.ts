import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const key = await prisma.apiKey.findUnique({ where: { id } });
  if (!key) return ERR.notFound('API key tidak ditemukan');
  const updated = await prisma.apiKey.update({
    where: { id },
    data: { status: 'revoked', revokedAt: new Date() },
  });
  return apiSuccess(updated);
}
