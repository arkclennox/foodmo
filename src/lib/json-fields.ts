/**
 * Helpers for working with JSON-encoded array/object fields on the Prisma
 * models (needed while the MVP uses SQLite which lacks native array columns).
 * Swap these to direct field access if you migrate to Postgres with native
 * arrays/JSON.
 */

export function parseJsonArray<T = string>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function parseJsonObject<T = Record<string, unknown>>(
  value: string | null | undefined,
): T | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as T;
    }
    return null;
  } catch {
    return null;
  }
}

export function toJsonString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value) && value.length === 0) return null;
  return JSON.stringify(value);
}
