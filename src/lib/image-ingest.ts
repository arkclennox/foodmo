/**
 * Image ingestion pipeline for listings/articles.
 *
 * Given a source URL or a raw Buffer, this module:
 *   1. Downloads (if URL) the original bytes.
 *   2. Compresses + converts to WebP via sharp (max 1280px on the long edge).
 *   3. Uploads to R2 under a stable key derived from the listing slug
 *      and a short content-hash suffix (so different images don't
 *      overwrite each other for the same listing).
 *   4. Returns the resulting public R2 URL.
 *
 * Resilience:
 *   - URLs that return 4xx/5xx (e.g. Google's expired gps-cs-s tokens)
 *     bubble up an error so the caller can decide to drop / skip.
 *   - Already-R2 URLs are returned unchanged (idempotent).
 */
import crypto from 'crypto';
import sharp from 'sharp';
import { isR2Url, uploadToR2, existsInR2, r2PublicUrl } from './r2';

export type IngestResult = {
  url: string;
  key: string;
  bytes: number;
  width?: number;
  height?: number;
};

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; FoodMoBot/1.0; +https://www.foodmo.id/about)';

export async function fetchImageBuffer(
  sourceUrl: string,
  signal?: AbortSignal,
): Promise<Buffer> {
  const res = await fetch(sourceUrl, {
    headers: { 'User-Agent': DEFAULT_USER_AGENT },
    redirect: 'follow',
    signal,
  });
  if (!res.ok) {
    throw new Error(`fetch ${res.status} ${res.statusText}`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

export async function processImage(
  input: Buffer,
  opts: { maxEdge?: number; quality?: number } = {},
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const maxEdge = opts.maxEdge ?? 1280;
  const quality = opts.quality ?? 78;
  const pipeline = sharp(input, { failOn: 'none' })
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

export function imageKey(opts: {
  prefix: string;
  slug: string;
  buffer: Buffer;
}): string {
  const hash = crypto.createHash('sha1').update(opts.buffer).digest('hex').slice(0, 10);
  const safeSlug = opts.slug.replace(/[^a-z0-9-]+/gi, '-').slice(0, 80);
  return `${opts.prefix.replace(/\/+$/, '')}/${safeSlug}-${hash}.webp`;
}

/**
 * Ingest a remote image URL or raw Buffer into R2. Idempotent: a buffer
 * with the same content hash produces the same key and skips re-upload.
 */
export async function ingestImage(input: {
  source: string | Buffer;
  prefix: string;
  slug: string;
  signal?: AbortSignal;
  maxEdge?: number;
  quality?: number;
}): Promise<IngestResult> {
  if (typeof input.source === 'string' && isR2Url(input.source)) {
    return {
      url: input.source,
      key: input.source,
      bytes: 0,
    };
  }
  const original =
    typeof input.source === 'string'
      ? await fetchImageBuffer(input.source, input.signal)
      : input.source;

  const { buffer, width, height } = await processImage(original, {
    maxEdge: input.maxEdge,
    quality: input.quality,
  });
  const key = imageKey({ prefix: input.prefix, slug: input.slug, buffer });

  if (await existsInR2(key)) {
    return { url: r2PublicUrl(key), key, bytes: buffer.length, width, height };
  }

  const url = await uploadToR2({
    key,
    body: buffer,
    contentType: 'image/webp',
  });

  return { url, key, bytes: buffer.length, width, height };
}
