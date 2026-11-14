import Link from 'next/link';
import { ListingCard, type ListingCardData } from './ListingCard';
import { ListingFilter } from './ListingFilter';
import { Pagination } from './Pagination';
import type { DirectoryState } from '@/lib/listing-index';

type Option = { slug: string; name: string };

export type DirectoryOptions = {
  basePath: string;
  /** Filters baked into the page (e.g. the city on /kota/[slug]); never put in the URL. */
  fixed?: Partial<Pick<DirectoryState, 'city' | 'category'>>;
  categories: Option[];
  cities: Option[];
  facilities: string[];
  hideCity?: boolean;
  hideCategory?: boolean;
};

export function directoryHref(opts: DirectoryOptions, state: DirectoryState, page: number) {
  const qs = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => {
    if (!v) return;
    if (opts.fixed && k in opts.fixed) return;
    if (k === 'sort' && v === 'latest') return;
    qs.set(k, String(v));
  });
  if (page > 1) qs.set('page', String(page));
  const s = qs.toString();
  return s ? `${opts.basePath}?${s}` : opts.basePath;
}

/** Pure markup shared by the server-rendered first page and the client view. */
export function DirectoryLayout({
  options,
  state,
  items,
  total,
  page,
  totalPages,
  loading = false,
}: {
  options: DirectoryOptions;
  state: DirectoryState;
  items: ListingCardData[];
  total: number;
  page: number;
  totalPages: number;
  loading?: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <ListingFilter
        key={JSON.stringify(state)}
        basePath={options.basePath}
        state={state}
        categories={options.categories}
        cities={options.cities}
        facilities={options.facilities}
        hideCity={options.hideCity}
        hideCategory={options.hideCategory}
      />
      <div>
        <p className="mb-4 text-sm text-black/60" aria-live="polite">
          {loading ? 'Memuat hasil…' : `${total.toLocaleString('id-ID')} tempat makan ditemukan`}
        </p>
        {loading ? null : items.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="mb-2 text-lg font-semibold text-black">Belum ada tempat makan yang cocok.</p>
            <p className="mb-4 text-sm text-black/60">Coba ubah atau hapus beberapa filter pencarianmu.</p>
            <Link prefetch={false} href={options.basePath} className="btn-primary">
              Reset filter
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            buildHref={(p) => directoryHref(options, state, p)}
          />
        )}
      </div>
    </div>
  );
}
