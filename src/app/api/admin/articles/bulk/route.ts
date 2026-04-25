import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, ERR } from '@/lib/api-response';

export async function PATCH(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }

  const { ids, status, categoryId } = body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return ERR.validation('Ids tidak valid');
  }

  const data: Record<string, any> = {};
  if (status !== undefined && status !== '') data.status = status;
  if (categoryId !== undefined) data.categoryId = categoryId || null;

  if (status === 'published') {
    data.publishedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return ERR.validation('Tidak ada field yang diupdate');
  }

  try {
    const result = await prisma.article.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return apiSuccess({ count: result.count });
  } catch (err) {
    return ERR.server('Gagal update data');
  }
}

export async function DELETE(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return ERR.validation('Body harus JSON');
  }

  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return ERR.validation('Ids tidak valid');
  }

  try {
    const result = await prisma.article.deleteMany({
      where: { id: { in: ids } },
    });
    return apiSuccess({ count: result.count });
  } catch (err) {
    return ERR.server('Gagal menghapus data');
  }
}
