import { z } from 'zod';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return ERR.validation('Data tidak valid', parsed.error.format());
  }
  await prisma.contactMessage.create({ data: parsed.data });
  return apiSuccess({ ok: true }, { status: 201 });
}
