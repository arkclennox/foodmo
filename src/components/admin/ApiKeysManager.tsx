'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { API_KEY_PERMISSIONS } from '@/lib/api-key';
import { KeyIcon, TrashIcon } from '@/components/icons';

type ApiKeyRow = {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  status: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeysManager({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([
    'articles:create',
    'articles:update',
  ]);
  const [busy, setBusy] = useState(false);
  const [createdRaw, setCreatedRaw] = useState<{ key: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function togglePerm(p: string) {
    setPermissions((cur) => (cur.includes(p) ? cur.filter((c) => c !== p) : [...cur, p]));
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, permissions }),
      });
      const data = (await res.json()) as {
        success: boolean;
        data?: { key: string; name: string };
        error?: { message?: string };
      };
      if (!res.ok || !data.success) throw new Error(data.error?.message ?? 'Gagal');
      setCreatedRaw(data.data ?? null);
      setName('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  async function onAction(id: string, action: 'revoke' | 'regenerate' | 'delete') {
    if (action === 'revoke' && !confirm('Revoke API key ini?')) return;
    if (action === 'delete' && !confirm('Hapus permanen API key ini?')) return;

    if (action === 'delete') {
      const res = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' });
      if (!res.ok) alert('Gagal hapus');
      router.refresh();
      return;
    }
    const res = await fetch(`/api/admin/api-keys/${id}/${action}`, { method: 'POST' });
    const data = (await res.json()) as {
      success: boolean;
      data?: { key?: string; name?: string };
      error?: { message?: string };
    };
    if (!res.ok || !data.success) {
      alert(data.error?.message ?? 'Gagal');
      return;
    }
    if (action === 'regenerate' && data.data?.key) {
      setCreatedRaw({ key: data.data.key, name: data.data.name ?? 'regenerated' });
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <form onSubmit={onCreate} className="card space-y-3 p-5">
        <h2 className="text-base font-semibold text-black">Buat API key baru</h2>
        <div>
          <label className="label-base">Nama / keperluan *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Integrasi CMS A"
            className="input-base"
          />
        </div>
        <div>
          <label className="label-base">Permissions</label>
          <div className="space-y-1.5">
            {API_KEY_PERMISSIONS.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={permissions.includes(p)}
                  onChange={() => togglePerm(p)}
                  className="h-4 w-4 accent-[color:#01083C]"
                />
                <code className="rounded bg-soft px-1">{p}</code>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={busy}>
          {busy ? 'Membuat…' : 'Buat API key'}
        </button>
      </form>
      <div className="space-y-4">
        {createdRaw && (
          <div className="card border-2 border-green-400 bg-green-50 p-5">
            <div className="mb-1 flex items-center gap-2 font-semibold text-green-800">
              <KeyIcon className="h-4 w-4" /> API key dibuat: {createdRaw.name}
            </div>
            <p className="mb-3 text-sm text-green-800/80">
              Salin sekarang — tidak akan ditampilkan lagi.
            </p>
            <code className="block select-all break-all rounded-md border border-green-200 bg-white p-3 text-sm">
              {createdRaw.key}
            </code>
            <button
              className="btn-secondary mt-3"
              onClick={() => setCreatedRaw(null)}
              type="button"
            >
              Tutup
            </button>
          </div>
        )}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-soft text-left text-xs uppercase tracking-wide text-black/60">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Terakhir dipakai</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {keys.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-black/60">
                    Belum ada API key.
                  </td>
                </tr>
              )}
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3 font-medium text-black">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-black/70">
                    {k.keyPreview}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {k.permissions.map((p) => (
                        <span key={p} className="badge-outline text-xs">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        k.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/70">
                    {k.lastUsedAt
                      ? new Date(k.lastUsedAt).toLocaleString('id-ID')
                      : 'Belum'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {k.status === 'active' && (
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onAction(k.id, 'revoke')}
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => onAction(k.id, 'regenerate')}
                      >
                        Regenerate
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => onAction(k.id, 'delete')}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
