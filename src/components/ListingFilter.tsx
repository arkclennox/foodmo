import Link from 'next/link';
import { PRICE_RANGES, PRICE_RANGE_LABEL, FACILITY_OPTIONS } from '@/lib/constants';

type CategoryOption = { slug: string; name: string };
type CityOption = { slug: string; name: string };

export type ListingFilterState = {
  search: string;
  category: string;
  city: string;
  price: string;
  facility: string;
  sort: string;
};

function buildHref(base: string, params: Record<string, string>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) qs.set(k, v);
  });
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

export function ListingFilter({
  basePath,
  state,
  categories,
  cities,
  hideCategory = false,
  hideCity = false,
}: {
  basePath: string;
  state: ListingFilterState;
  categories: CategoryOption[];
  cities: CityOption[];
  hideCategory?: boolean;
  hideCity?: boolean;
}) {
  const baseParams: Record<string, string> = { ...state };

  return (
    <aside className="card space-y-6 p-5">
      <form action={basePath} method="get" className="space-y-4">
        <div>
          <label htmlFor="search" className="label-base">
            Cari
          </label>
          <input
            id="search"
            name="search"
            defaultValue={state.search}
            placeholder="Nama tempat, alamat…"
            className="input-base"
          />
        </div>
        {!hideCategory && (
          <div>
            <label htmlFor="category" className="label-base">
              Kategori
            </label>
            <select
              id="category"
              name="category"
              defaultValue={state.category}
              className="input-base"
            >
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {!hideCity && (
          <div>
            <label htmlFor="city" className="label-base">
              Kota
            </label>
            <select
              id="city"
              name="city"
              defaultValue={state.city}
              className="input-base"
            >
              <option value="">Semua kota</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="price" className="label-base">
            Harga
          </label>
          <select id="price" name="price" defaultValue={state.price} className="input-base">
            <option value="">Semua harga</option>
            {PRICE_RANGES.map((p) => (
              <option key={p} value={p}>
                {PRICE_RANGE_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="facility" className="label-base">
            Fasilitas
          </label>
          <select
            id="facility"
            name="facility"
            defaultValue={state.facility}
            className="input-base"
          >
            <option value="">Semua fasilitas</option>
            {FACILITY_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sort" className="label-base">
            Urutkan
          </label>
          <select id="sort" name="sort" defaultValue={state.sort} className="input-base">
            <option value="latest">Terbaru</option>
            <option value="rating">Rating tertinggi</option>
            <option value="name">Nama A–Z</option>
            <option value="featured">Featured</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button type="submit" className="btn-primary flex-1">
            Terapkan filter
          </button>
          <Link href={basePath} className="btn-secondary">
            Reset
          </Link>
        </div>
      </form>
      {(state.category || state.city || state.price || state.facility || state.search) && (
        <div className="space-y-2 border-t border-border pt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
            Filter aktif
          </div>
          <div className="flex flex-wrap gap-1.5">
            {state.search && (
              <Link href={buildHref(basePath, { ...baseParams, search: '' })} className="badge-outline">
                Cari: {state.search} ✕
              </Link>
            )}
            {state.category && (
              <Link href={buildHref(basePath, { ...baseParams, category: '' })} className="badge-outline">
                Kategori: {state.category} ✕
              </Link>
            )}
            {state.city && (
              <Link href={buildHref(basePath, { ...baseParams, city: '' })} className="badge-outline">
                Kota: {state.city} ✕
              </Link>
            )}
            {state.price && (
              <Link href={buildHref(basePath, { ...baseParams, price: '' })} className="badge-outline">
                Harga: {PRICE_RANGE_LABEL[state.price] ?? state.price} ✕
              </Link>
            )}
            {state.facility && (
              <Link href={buildHref(basePath, { ...baseParams, facility: '' })} className="badge-outline">
                Fasilitas: {state.facility} ✕
              </Link>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
