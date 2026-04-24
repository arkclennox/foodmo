import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';
import { apiSuccess, ERR } from '@/lib/api-response';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
    return ERR.validation('Email atau password tidak valid');
  }
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) return ERR.unauthorized('Email atau password salah');
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return ERR.unauthorized('Email atau password salah');

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  await setSessionCookie(token);
  return apiSuccess({ user: { id: user.id, email: user.email, role: user.role } });
}
