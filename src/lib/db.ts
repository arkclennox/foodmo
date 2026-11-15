import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Errors that mean the connection dropped, not that the query was wrong. */
const RETRYABLE_CODES = new Set(['P1001', 'P1002', 'P1017', 'P2024']);

function isConnectionError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  if (e?.code && RETRYABLE_CODES.has(e.code)) return true;
  return /Can't reach database server|Closed|Connection terminated|ECONNRESET/i.test(e?.message ?? '');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createClient(): PrismaClient {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  // The static build runs thousands of read queries in a row; a short pooler
  // hiccup shouldn't fail the whole export. Next retries a failed page right
  // away, so back off here instead (2s, 4s, 8s, 16s, 30s).
  if (process.env.STATIC_EXPORT !== '1') return base;
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            if (attempt >= 5 || !isConnectionError(err)) throw err;
            await sleep(Math.min(2000 * 2 ** attempt, 30000));
          }
        }
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
