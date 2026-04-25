'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EditIcon } from '@/components/icons';
import { DeleteButton } from '@/components/admin/DeleteButton';

type Listing = any; // simplified type for passing data
type Option = { id: string; name: string };

export function ListingBulkTable({
  listings,
  categories,
  cities,
}: {
  listings: Listing[];
  categories: Option[];
  cities: Option[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Bulk edit states
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkCity, setBulkCity] = useState('');

  const toggleSelectAll = () => {
    if (selected.size === listings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(listings.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const handleBulkAction = async (action: 'update' | 'delete') => {
    if (selected.size === 0) return;
    
    if (action === 'delete') {
      if (!confirm(`Hapus ${selected.size} listing yang dipilih secara permanen?`)) return;
    } else {
      if (!bulkStatus && !bulkCategory && !bulkCity) {
        alert('Pilih setidaknya satu field untuk diupdate!');
        return;
      }
      if (!confirm(`Update ${selected.size} listing yang dipilih?`)) return;
    }

    setIsUpdating(true);
    try {
      const endpoint = '/api/admin/listings/bulk';
      const payload = action === 'delete' 
        ? { ids: Array.from(selected) }
        : { 
            ids: Array.from(selected), 
            status: bulkStatus || undefined,
            categoryId: bulkCategory || undefined,
            cityId: bulkCity || undefined
          };

      const res = await fetch(endpoint, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelected(new Set());
        setBulkStatus('');
        setBulkCategory('');
        setBulkCity('');
        router.refresh();
      } else {
        const err = await res.json();
        alert('Gagal: ' + (err.error?.message || 'Unknown error'));
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700';
      case 'draft':
        return 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700';
      case 'archived':
        return 'rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700';
      default:
        return 'badge-outline';
    }
  };

  return (
    <div className="card overflow-hidden">
      {selected.size > 0 && (
        <div className="bg-blue-50/50 p-3 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="text-sm font-medium text-blue-800">
            {selected.size} item terpilih
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="input-base py-1.5 text-sm w-auto bg-white"
            >
              <option value="">-- Ubah Status --</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="input-base py-1.5 text-sm w-auto bg-white"
            >
              <option value="">-- Ubah Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={bulkCity}
              onChange={(e) => setBulkCity(e.target.value)}
              className="input-base py-1.5 text-sm w-auto bg-white"
            >
              <option value="">-- Ubah Kota --</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => handleBulkAction('update')}
              disabled={isUpdating || (!bulkStatus && !bulkCategory && !bulkCity)}
              className="btn-primary py-1.5 text-sm disabled:opacity-50"
            >
              Terapkan
            </button>
            <div className="w-px h-6 bg-blue-200 mx-1"></div>
            <button
              onClick={() => handleBulkAction('delete')}
              disabled={isUpdating}
              className="btn-secondary py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
            >
              Hapus Terpilih
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="bg-soft text-left text-xs uppercase tracking-wide text-black/60">
          <tr>
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={listings.length > 0 && selected.size === listings.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-4 py-3">Nama</th>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Kota</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Featured</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {listings.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-black/60">
                Belum ada listing.
              </td>
            </tr>
          )}
          {listings.map((l) => (
            <tr key={l.id} className={selected.has(l.id) ? 'bg-blue-50/20' : ''}>
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selected.has(l.id)}
                  onChange={() => toggleSelect(l.id)}
                />
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-black">{l.name}</div>
                <div className="text-xs text-black/50">/{l.slug}</div>
              </td>
              <td className="px-4 py-3 text-black/70">{l.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-black/70">{l.city?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <span className={statusBadge(l.status)}>{l.status}</span>
              </td>
              <td className="px-4 py-3">{l.isFeatured ? 'Ya' : '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/listings/${l.id}/edit`}
                    className="btn-secondary"
                  >
                    <EditIcon className="h-4 w-4" /> Edit
                  </Link>
                  <DeleteButton
                    endpoint={`/api/admin/listings/${l.id}`}
                    confirmText={`Hapus listing "${l.name}"?`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
