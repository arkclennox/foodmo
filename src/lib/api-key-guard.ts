import { NextRequest } from 'next/server';
import { prisma } from './db';
import { hashApiKey } from './api-key';
import { parseJsonArray } from './json-fields';
import { ERR } from './api-response';

export type ApiKeyAuthSuccess = {
  ok: true;
  apiKeyId: string;
  permissions: string[];
};

export type ApiKeyAuthFailure = {
  ok: false;
  response: Response;
};

const bucket = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = bucket.get(key);
  if (!entry || entry.reset < now) {
    bucket.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
}

export async function authenticateApiKey(
  req: NextRequest,
  requiredPermission: string,
): Promise<ApiKeyAuthSuccess | ApiKeyAuthFailure> {
  const raw = req.headers.get('x-api-key');
  if (!raw) {
    return { ok: false, response: ERR.unauthorized('Missing x-api-key header') };
  }

  if (!rateLimit(raw)) {
    return {
      ok: false,
      response: ERR.forbidden('Rate limit exceeded, please retry later'),
    };
  }

  const keyHash = hashApiKey(raw);
  const record = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!record || record.status !== 'active') {
    return { ok: false, response: ERR.unauthorized('Invalid or revoked API key') };
  }

  const permissions = parseJsonArray<string>(record.permissions);
  if (!permissions.includes(requiredPermission)) {
    return {
      ok: false,
      response: ERR.forbidden(`Missing permission: ${requiredPermission}`),
    };
  }

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return { ok: true, apiKeyId: record.id, permissions };
}
