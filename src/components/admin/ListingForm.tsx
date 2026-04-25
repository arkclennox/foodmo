'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { slugify } from '@/lib/slug';
import { PRICE_RANGES, PRICE_RANGE_LABEL, FACILITY_OPTIONS, LISTING_STATUSES } from '@/lib/constants';

export type ListingFormData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  cityId: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  whatsapp: string;
  websiteUrl: string;
  instagramUrl: string;
  shopeeFoodUrl: string;
  tiktokUrl: string;
  googleMapsUrl: string;
  priceRange: string;
  openingHours: string;
  facilities: string[];
  menuHighlights: string[];
  featuredImageUrl: string;
  galleryImages: string[];
  status: string;
  isFeatured: boolean;
  metaTitle: string;
  metaDescription: string;
};

export const emptyListingForm: ListingFormData = {
  name: '',
  slug: '',
  description: '',
  shortDescription: '',
  categoryId: '',
  cityId: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
  whatsapp: '',
  websiteUrl: '',
  instagramUrl: '',
  shopeeFoodUrl: '',
  tiktokUrl: '',
  googleMapsUrl: '',
  priceRange: '',
  openingHours: '',
  facilities: [],
  menuHighlights: [],
  featuredImageUrl: '',
  galleryImages: [],
  status: 'draft',
  isFeatured: false,
  metaTitle: '',
  metaDescription: '',
};

type Option = { id: string; name: string };

export function ListingForm({
  initial,
  categories,
  cities,
  listingId,
}: {
  initial: ListingFormData;
  categories: Option[];
  cities: Option[];
  listingId?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<ListingFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const autoSlug = useMemo(() => slugify(data.name), [data.name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...data,
      slug: data.slug || autoSlug,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      categoryId: data.categoryId || null,
      cityId: data.cityId || null,
    };
    const url = listingId ? `/api/admin/listings/${listingId}` : '/api/admin/listings';
    const method = listingId ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { success: boolean; data?: { id: string }; error?: { message?: string } };
      if (!res.ok || !body.success) {
        throw new Error(body.error?.message ?? 'Gagal menyimpan');
      }
      router.push('/admin/listings');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  function toggleArrayValue(key: 'facilities', value: string) {
    const list = data[key];
    update(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Informasi dasar</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-base">Nama tempat *</label>
            <input
              required
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Slug</label>
            <input
              value={data.slug}
              onChange={(e) => update('slug', e.target.value)}
              placeholder={autoSlug}
              className="input-base"
            />
            <p className="mt-1 text-xs text-black/50">
              Kosongkan untuk otomatis dari nama. Akan menjadi: /{data.slug || autoSlug || '…'}
            </p>
          </div>
          <div>
            <label className="label-base">Kategori *</label>
            <select
              required
              value={data.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="input-base"
            >
              <option value="">Pilih kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-base">Kota *</label>
            <select
              required
              value={data.cityId}
              onChange={(e) => update('cityId', e.target.value)}
              className="input-base"
            >
              <option value="">Pilih kota</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Alamat *</label>
            <input
              required
              value={data.address}
              onChange={(e) => update('address', e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">Latitude</label>
            <input
              type="number"
              step="any"
              value={data.latitude}
              onChange={(e) => update('latitude', e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">Longitude</label>
            <input
              type="number"
              step="any"
              value={data.longitude}
              onChange={(e) => update('longitude', e.target.value)}
              className="input-base"
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Deskripsi</h2>
        <div>
          <label className="label-base">Deskripsi singkat</label>
          <input
            value={data.shortDescription}
            onChange={(e) => update('shortDescription', e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">Deskripsi lengkap *</label>
          <textarea
            required
            rows={6}
            value={data.description}
            onChange={(e) => update('description', e.target.value)}
            className="input-base"
          />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Kontak</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Telepon</label>
            <input
              value={data.phone}
              onChange={(e) => update('phone', e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">WhatsApp</label>
            <input
              value={data.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              placeholder="62812…"
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">Website</label>
            <input
              type="url"
              value={data.websiteUrl}
              onChange={(e) => update('websiteUrl', e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">Instagram URL</label>
            <input
              type="url"
              value={data.instagramUrl}
              onChange={(e) => update('instagramUrl', e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">Shopee Food URL</label>
            <input
              type="url"
              value={data.shopeeFoodUrl}
              onChange={(e) => update('shopeeFoodUrl', e.target.value)}
              placeholder="https://shopee.co.id/..."
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">TikTok URL</label>
            <input
              type="url"
              value={data.tiktokUrl}
              onChange={(e) => update('tiktokUrl', e.target.value)}
              placeholder="https://www.tiktok.com/@..."
              className="input-base"
            />
          </div>
          <div>
            <label className="label-base">Google Maps URL</label>
            <input
              type="url"
              value={data.googleMapsUrl}
              onChange={(e) => update('googleMapsUrl', e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="input-base"
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Harga & jam buka</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Range harga</label>
            <select
              value={data.priceRange}
              onChange={(e) => update('priceRange', e.target.value)}
              className="input-base"
            >
              <option value="">—</option>
              {PRICE_RANGES.map((p) => (
                <option key={p} value={p}>
                  {PRICE_RANGE_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label-base">
            Jam buka (JSON, contoh: {'{"mon":"10:00-22:00"}'})
          </label>
          <textarea
            rows={3}
            value={data.openingHours}
            onChange={(e) => update('openingHours', e.target.value)}
            placeholder='{"mon":"10:00-22:00","sun":"Tutup"}'
            className="input-base font-mono text-xs"
          />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Menu unggulan</h2>
        <ArrayInput
          value={data.menuHighlights}
          onChange={(v) => update('menuHighlights', v)}
          placeholder="Misal: Bakso Urat Spesial"
        />
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Fasilitas</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FACILITY_OPTIONS.map((f) => {
            const active = data.facilities.some((df) => df.toLowerCase() === f.toLowerCase());
            return (
              <label
                key={f}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                  active
                    ? 'border-navy bg-navy/5 text-navy'
                    : 'border-border bg-white text-black/70 hover:bg-soft'
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => {
                    if (e.target.checked) {
                      update('facilities', [...data.facilities, f]);
                    } else {
                      update(
                        'facilities',
                        data.facilities.filter((df) => df.toLowerCase() !== f.toLowerCase())
                      );
                    }
                  }}
                  className="h-4 w-4 accent-[color:#01083C]"
                />
                {f}
              </label>
            );
          })}
        </div>

        <div className="mt-4 border-t border-black/5 pt-4">
          <p className="text-sm font-medium text-black mb-2">Fasilitas Tambahan (Kustom / Import)</p>
          <p className="text-xs text-black/60 mb-3">
            Gunakan ini jika ada fasilitas yang tidak masuk dalam daftar standar di atas.
          </p>
          <ArrayInput
            value={data.facilities.filter(
              (df) => !FACILITY_OPTIONS.some((opt) => opt.toLowerCase() === df.toLowerCase())
            )}
            onChange={(newCustom) => {
              const optionsSelected = data.facilities.filter((df) =>
                FACILITY_OPTIONS.some((opt) => opt.toLowerCase() === df.toLowerCase())
              );
              update('facilities', [...optionsSelected, ...newCustom]);
            }}
            placeholder="Tambah fasilitas lain..."
          />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Gambar</h2>
        <div>
          <label className="label-base">URL gambar utama</label>
          <input
            type="url"
            value={data.featuredImageUrl}
            onChange={(e) => update('featuredImageUrl', e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">URL gambar galeri</label>
          <ArrayInput
            value={data.galleryImages}
            onChange={(v) => update('galleryImages', v)}
            placeholder="https://…/foto.jpg"
          />
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-black">Publikasi & SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base">Status</label>
            <select
              value={data.status}
              onChange={(e) => update('status', e.target.value)}
              className="input-base"
            >
              {LISTING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.isFeatured}
                onChange={(e) => update('isFeatured', e.target.checked)}
                className="h-4 w-4 accent-[color:#01083C]"
              />
              Tampilkan sebagai featured
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Meta title</label>
            <input
              value={data.metaTitle}
              onChange={(e) => update('metaTitle', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-base">Meta description</label>
            <textarea
              rows={3}
              value={data.metaDescription}
              onChange={(e) => update('metaDescription', e.target.value)}
              className="input-base"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : listingId ? 'Simpan perubahan' : 'Buat listing'}
        </button>
      </div>
    </form>
  );
}

function ArrayInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="input-base"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (draft.trim()) {
                onChange([...value, draft.trim()]);
                setDraft('');
              }
            }
          }}
        />
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            if (draft.trim()) {
              onChange([...value, draft.trim()]);
              setDraft('');
            }
          }}
        >
          Tambah
        </button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <li
              key={`${v}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 px-3 py-1 text-xs text-navy"
            >
              {v}
              <button
                type="button"
                aria-label={`Hapus ${v}`}
                className="text-navy/60 hover:text-red-600"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
