'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { slugify } from '@/lib/slug';
import { TrashIcon } from '@/components/icons';

type Kind = 'category' | 'city';

type BaseItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type CategoryItem = BaseItem & { type: string };
type CityItem = BaseItem & { province: string };

type Item = CategoryItem | CityItem;

function isCategory(item: Item): item is CategoryItem {
  return (item as CategoryItem).type !== undefined;
}

export function TaxonomyManager({
  type,
  endpoint,
  items,
}: {
  type: Kind;
  endpoint: string;
  items: Item[];
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [extra, setExtra] = useState(type === 'category' ? 'listing' : '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        name,
        slug: slug || slugify(name),
        description,
      };
      if (type === 'category') payload.type = extra || 'listing';
      else if (extra) payload.province = extra;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success: boolean; error?: { message?: string } };
      if (!res.ok || !data.success) throw new Error(data.error?.message ?? 'Gagal membuat');
      setName('');
      setSlug('');
      setDescription('');
      setExtra(type === 'category' ? 'listing' : '');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  async function onUpdate(item: Item, patch: Partial<Item>) {
    const res = await fetch(`${endpoint}/${item.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = (await res.json()) as { success: boolean; error?: { message?: string } };
    if (!res.ok || !data.success) {
      alert(data.error?.message ?? 'Gagal update');
      return;
    }
    router.refresh();
  }

  async function onDelete(item: Item) {
    if (!confirm(`Hapus ${type === 'category' ? 'kategori' : 'kota'} "${item.name}"?`)) return;
    const res = await fetch(`${endpoint}/${item.id}`, { method: 'DELETE' });
    const data = (await res.json()) as { success: boolean; error?: { message?: string } };
    if (!res.ok || !data.success) {
      alert(data.error?.message ?? 'Gagal hapus');
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <form onSubmit={onCreate} className="card space-y-3 p-5">
        <h2 className="text-base font-semibold text-black">
          Tambah {type === 'category' ? 'kategori' : 'kota'}
        </h2>
        <div>
          <label className="label-base">Nama *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={slugify(name)}
            className="input-base"
          />
        </div>
        {type === 'category' && (
          <div>
            <label className="label-base">Tipe</label>
            <select
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="input-base"
            >
              <option value="listing">Listing</option>
              <option value="article">Article</option>
            </select>
          </div>
        )}
        {type === 'city' && (
          <div>
            <label className="label-base">Provinsi</label>
            <input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="input-base"
            />
          </div>
        )}
        <div>
          <label className="label-base">Deskripsi</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-base"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Menyimpan…' : 'Tambah'}
        </button>
      </form>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-black/60">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">
                {type === 'category' ? 'Tipe' : 'Provinsi'}
              </th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-black/60">
                  Belum ada data.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <input
                    defaultValue={item.name}
                    onBlur={(e) => {
                      if (e.target.value !== item.name) onUpdate(item, { name: e.target.value });
                    }}
                    className="input-base h-9 text-sm"
                  />
                </td>
                <td className="px-4 py-3 text-xs text-black/60">{item.slug}</td>
                <td className="px-4 py-3 text-xs text-black/60">
                  {isCategory(item) ? item.type : item.province || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => onDelete(item)}
                  >
                    <TrashIcon className="h-4 w-4" /> Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
