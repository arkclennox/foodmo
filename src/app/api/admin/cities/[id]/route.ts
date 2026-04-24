import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { cityInputSchema } from '@/lib/validators';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = cityInputSchema.partial().safeParse(body);
  if (!parsed.success) return ERR.validation('Data tidak valid', parsed.error.format());
  const existing = await prisma.city.findUnique({ where: { id } });
  if (!existing) return ERR.notFound('Kota tidak ditemukan');
  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) {
    data.name = parsed.data.name;
    if (parsed.data.slug === undefined) data.slug = slugify(parsed.data.name);
  }
  if (parsed.data.slug !== undefined) data.slug = parsed.data.slug || slugify(parsed.data.name ?? existing.name);
  if (parsed.data.province !== undefined) data.province = parsed.data.province;
  if (parsed.data.description !== undefined) data.description = parsed.data.description;
  if (parsed.data.metaTitle !== undefined) data.metaTitle = parsed.data.metaTitle;
  if (parsed.data.metaDescription !== undefined) data.metaDescription = parsed.data.metaDescription;
  if (data.slug && data.slug !== existing.slug) {
    const conflict = await prisma.city.findUnique({ where: { slug: String(data.slug) } });
    if (conflict && conflict.id !== id) return ERR.conflict('Slug sudah dipakai');
  }
  const updated = await prisma.city.update({ where: { id }, data });
  return apiSuccess(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.city.delete({ where: { id } }).catch(() => null);
  return apiSuccess({ ok: true });
}
