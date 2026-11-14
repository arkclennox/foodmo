import { Suspense } from 'react';
import { DirectoryLayout, type DirectoryOptions } from './DirectoryLayout';
import { DirectoryView } from './DirectoryView';
import type { ListingCardData } from './ListingCard';
import type { DirectoryState } from '@/lib/listing-index';

/**
 * Server wrapper: the static HTML contains the first page (Suspense fallback),
 * then DirectoryView takes over in the browser and applies the query string.
 */
export function Directory({
  options,
  initial,
  pageSize,
}: {
  options: DirectoryOptions;
  initial: { items: ListingCardData[]; total: number; totalPages: number };
  pageSize: number;
}) {
  const defaultState: DirectoryState = {
    search: '',
    category: options.fixed?.category ?? '',
    city: options.fixed?.city ?? '',
    price: '',
    facility: '',
    sort: 'latest',
  };
  return (
    <Suspense
      fallback={<DirectoryLayout options={options} state={defaultState} page={1} {...initial} />}
    >
      <DirectoryView options={options} initial={initial} pageSize={pageSize} />
    </Suspense>
  );
}
