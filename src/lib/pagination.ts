export function parsePagination(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  defaults: { page?: number; limit?: number } = {},
) {
  const getVal = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? undefined;
    }
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const rawPage = Number(getVal('page'));
  const rawLimit = Number(getVal('limit'));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : defaults.page ?? 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1 && rawLimit <= 100
      ? Math.floor(rawLimit)
      : defaults.limit ?? 12;
  return { page, limit, skip: (page - 1) * limit };
}
