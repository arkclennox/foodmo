/**
 * Cloudflare R2 client + helpers for uploading and deleting objects.
 *
 * R2 is S3-compatible so we use the AWS SDK with R2's endpoint URL.
 * Public read URLs go through the bucket's pub-<hash>.r2.dev domain
 * (or a custom domain if R2_PUBLIC_URL is configured for one).
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.R2_PUBLIC_URL;

function assertEnv() {
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error(
      'R2 env vars missing: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL',
    );
  }
}

let _client: S3Client | null = null;
export function r2Client(): S3Client {
  assertEnv();
  if (_client) return _client;
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId!,
      secretAccessKey: secretAccessKey!,
    },
  });
  return _client;
}

export function r2Bucket(): string {
  assertEnv();
  return bucket!;
}

export function r2PublicUrl(key: string): string {
  assertEnv();
  return `${publicUrl!.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}

export function isR2Url(url: string | null | undefined): boolean {
  if (!url || !publicUrl) return false;
  return url.startsWith(publicUrl);
}

export async function uploadToR2(opts: {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}): Promise<string> {
  await r2Client().send(
    new PutObjectCommand({
      Bucket: r2Bucket(),
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
      CacheControl: opts.cacheControl ?? 'public, max-age=31536000, immutable',
    }),
  );
  return r2PublicUrl(opts.key);
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client().send(
    new DeleteObjectCommand({ Bucket: r2Bucket(), Key: key }),
  );
}

export async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2Client().send(new HeadObjectCommand({ Bucket: r2Bucket(), Key: key }));
    return true;
  } catch (err: unknown) {
    const e = err as { $metadata?: { httpStatusCode?: number } };
    if (e?.$metadata?.httpStatusCode === 404) return false;
    throw err;
  }
}

/**
 * Given a R2 public URL, extract the object key for use with delete/head.
 * Returns null if the URL is not from our R2 bucket.
 */
export function r2KeyFromUrl(url: string): string | null {
  if (!isR2Url(url)) return null;
  return url.slice(publicUrl!.length).replace(/^\/+/, '');
}
