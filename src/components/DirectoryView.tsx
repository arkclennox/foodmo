'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DirectoryLayout, type DirectoryOptions } from './DirectoryLayout';
import type { ListingCardData } from './ListingCard';
import { queryIndex, type DirectoryState, type ListingIndex } from '@/lib/listing-index';

let indexPromise: Promise<ListingIndex> | null = null;
function loadIndex(): Promise<ListingIndex> {
  indexPromise ??= fetch('/data/listings.json').then((r) => {
    if (!r.ok) throw new Error(`index ${r.status}`);
    return r.json() as Promise<ListingIndex>;
  });
  indexPromise.catch(() => {
    indexPromise = null; // allow a retry on the next navigation
  });
  return indexPromise;
}

/**
 * Directory search/filter/sort/pagination for the static site. The default
 * view (no query string) is the server-rendered first page passed in as
 * `initial`; anything else is computed in the browser from the listing index.
 */
export function DirectoryView({
  options,
  initial,
  pageSize,
}: {
  options: DirectoryOptions;
  initial: { items: ListingCardData[]; total: number; totalPages: number };
  pageSize: number;
}) {
  const sp = useSearchParams();
  const state: DirectoryState = {
    search: sp.get('search') ?? '',
    category: options.fixed?.category ?? sp.get('category') ?? '',
    city: options.fixed?.city ?? sp.get('city') ?? '',
    price: sp.get('price') ?? '',
    facility: sp.get('facility') ?? '',
    sort: sp.get('sort') || 'latest',
  };
  const rawPage = Number(sp.get('page'));
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const isDefault =
    page === 1 &&
    state.sort === 'latest' &&
    !state.search &&
    !state.price &&
    !state.facility &&
    (options.fixed?.category ? true : !state.category) &&
    (options.fixed?.city ? true : !state.city);

  const [index, setIndex] = useState<ListingIndex | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (isDefault || index) return;
    let alive = true;
    loadIndex()
      .then((d) => alive && setIndex(d))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [isDefault, index]);

  const key = JSON.stringify([state, page]);
  const result = useMemo(
    () => (isDefault || !index ? null : queryIndex(index, state, page, pageSize)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, key, isDefault, pageSize],
  );

  if (isDefault) {
    return <DirectoryLayout options={options} state={state} page={1} {...initial} />;
  }
  if (failed) {
    return (
      <div className="card px-6 py-16 text-center text-black/70">
        Gagal memuat data. Periksa koneksi lalu muat ulang halaman.
      </div>
    );
  }
  return (
    <DirectoryLayout
      options={options}
      state={state}
      page={page}
      items={result?.items ?? []}
      total={result?.total ?? 0}
      totalPages={result?.totalPages ?? 1}
      loading={!result}
    />
  );
}
