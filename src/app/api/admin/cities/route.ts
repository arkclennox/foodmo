import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { cityInputSchema } from '@/lib/validators';

export async function GET() {
  const cities = await prisma.city.findMany({ orderBy: { name: 'asc' } });
  return apiSuccess(cities);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = cityInputSchema.safeParse(body);
  if (!parsed.success) return ERR.validation('Data tidak valid', parsed.error.format());
  const input = parsed.data;
  const slug = input.slug?.trim() || slugify(input.name);
  const existing = await prisma.city.findUnique({ where: { slug } });
  if (existing) return ERR.conflict(`Slug "${slug}" sudah dipakai`);
  const created = await prisma.city.create({
    data: {
      name: input.name,
      slug,
      province: input.province ?? null,
      description: input.description ?? null,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
    },
  });
  return apiSuccess(created, { status: 201 });
}
