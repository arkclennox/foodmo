/**
 * Admin image upload endpoint.
 *
 * Accepts either:
 *   - multipart/form-data with a single "file" field, or
 *   - application/json with `{ url: "..." }` to ingest an external URL.
 *
 * Always returns `{ success: true, url: <r2-public-url> }`.
 *
 * Admin auth is enforced by middleware.ts (matcher includes /api/admin/*).
 */
import { NextRequest, NextResponse } from 'next/server';
import { ingestImage } from '@/lib/image-ingest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_PREFIXES = new Set([
  'listings/featured',
  'listings/gallery',
  'articles/featured',
  'misc',
]);

function err(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code: 'UPLOAD_ERROR', message } },
    { status },
  );
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? '';
  const url = new URL(req.url);
  const prefix = url.searchParams.get('prefix') ?? 'misc';
  const slug = url.searchParams.get('slug') ?? 'upload';
  if (!ALLOWED_PREFIXES.has(prefix)) return err(`Invalid prefix: ${prefix}`);

  try {
    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('file');
      if (!(file instanceof Blob)) return err('Missing "file" in form data');
      if (file.size > 10 * 1024 * 1024) return err('File too large (max 10MB)', 413);
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await ingestImage({ source: buffer, prefix, slug });
      return NextResponse.json({ success: true, ...result });
    }

    if (ct.includes('application/json')) {
      const body = (await req.json()) as { url?: string };
      if (!body.url) return err('Missing "url" in JSON body');
      const result = await ingestImage({ source: body.url, prefix, slug });
      return NextResponse.json({ success: true, ...result });
    }

    return err(`Unsupported content-type: ${ct}`);
  } catch (e) {
    return err((e as Error).message ?? 'Upload failed', 500);
  }
}
