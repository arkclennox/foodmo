import { prisma } from '@/lib/db';
import { apiSuccess } from '@/lib/api-response';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.apiKey.delete({ where: { id } }).catch(() => null);
  return apiSuccess({ ok: true });
}
