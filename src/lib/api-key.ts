import { createHash, randomBytes } from 'crypto';

const API_KEY_PREFIX = 'dk_';

function getHashSecret(): string {
  const secret = process.env.API_KEY_HASH_SECRET;
  if (!secret) {
    throw new Error('API_KEY_HASH_SECRET must be set in the environment');
  }
  return secret;
}

export function generateApiKey(): { raw: string; hash: string; preview: string } {
  const raw = `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
  return {
    raw,
    hash: hashApiKey(raw),
    preview: `${raw.slice(0, 10)}…${raw.slice(-4)}`,
  };
}

export function hashApiKey(raw: string): string {
  return createHash('sha256')
    .update(`${getHashSecret()}:${raw}`)
    .digest('hex');
}

export const API_KEY_PERMISSIONS = [
  'articles:create',
  'articles:update',
  'articles:read',
  'listings:create',
  'listings:update',
  'listings:read',
] as const;

export type ApiKeyPermission = (typeof API_KEY_PERMISSIONS)[number];

export function isValidPermission(value: string): value is ApiKeyPermission {
  return (API_KEY_PERMISSIONS as readonly string[]).includes(value);
}
