import { z } from 'zod';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';
import { generateApiKey, API_KEY_PERMISSIONS } from '@/lib/api-key';


const schema = z.object({
  name: z.string().min(1).max(200),
  permissions: z.array(z.enum(API_KEY_PERMISSIONS)).min(1),
});

export async function GET() {
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
  return apiSuccess(keys);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return ERR.validation('Data tidak valid', parsed.error.format());
  const { raw, hash, preview } = generateApiKey();
  await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      keyHash: hash,
      keyPreview: preview,
      permissions: JSON.stringify(parsed.data.permissions),
      status: 'active',
    },
  });
  return apiSuccess({ key: raw, name: parsed.data.name }, { status: 201 });
}
