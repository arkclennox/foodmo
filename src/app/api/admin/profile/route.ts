import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword, getSession, createSessionToken, setSessionCookie } from '@/lib/auth';
import { apiSuccess, ERR } from '@/lib/api-response';

const schema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    email: z.string().email().max(200).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).max(200).optional(),
  })
  .refine(
    (d) => !d.newPassword || d.currentPassword,
    { message: 'Password lama wajib diisi untuk mengganti password.', path: ['currentPassword'] }
  );

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return ERR.unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return ERR.validation(
      parsed.error.errors[0]?.message ?? 'Data tidak valid',
      parsed.error.format()
    );
  }

  const { name, email, currentPassword, newPassword } = parsed.data;

  // Fetch current user from DB
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return ERR.notFound('User tidak ditemukan');

  // Validate currentPassword if changing password
  if (newPassword) {
    if (!currentPassword) return ERR.validation('Password lama wajib diisi.');
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return ERR.validation('Password lama tidak sesuai.');
  }

  // Check email uniqueness if changing email
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return ERR.validation('Email sudah digunakan oleh akun lain.');
  }

  const updateData: Record<string, string> = {};
  if (name) updateData.name = name;
  if (email && email !== user.email) updateData.email = email;
  if (newPassword) updateData.passwordHash = await hashPassword(newPassword);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Re-issue session token if email changed
  if (email && email !== user.email) {
    const newToken = await createSessionToken({
      sub: updated.id,
      email: updated.email,
      role: updated.role,
    });
    await setSessionCookie(newToken);
  }

  return apiSuccess({ ok: true, name: updated.name, email: updated.email });
}
