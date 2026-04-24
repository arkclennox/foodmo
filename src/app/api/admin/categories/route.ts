import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { slugify } from '@/lib/slug';
import { categoryInputSchema } from '@/lib/validators';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return apiSuccess(categories);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) return ERR.validation('Data tidak valid', parsed.error.format());
  const input = parsed.data;
  const slug = input.slug?.trim() || slugify(input.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return ERR.conflict(`Slug "${slug}" sudah dipakai`);
  const created = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      type: input.type,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
    },
  });
  return apiSuccess(created, { status: 201 });
}
