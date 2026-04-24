'use client';

import { useState } from 'react';

type Props = {
  initialName: string;
  initialEmail: string;
};

export function AdminProfileForm({ initialName, initialEmail }: Props) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = { name, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as {
        success: boolean;
        error?: { message?: string };
      };

      if (!res.ok || !body.success) {
        throw new Error(body.error?.message ?? 'Gagal menyimpan perubahan.');
      }

      setSuccess('Data akun berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Reload if email changed so session UI updates
      if (email !== initialEmail) {
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Feedback */}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Informasi Akun */}
      <div className="card p-5 space-y-4">
        <h2 className="text-base font-semibold text-black">Informasi Akun</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-base" htmlFor="admin-name">Nama</label>
            <input
              id="admin-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="label-base" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              placeholder="email@contoh.com"
            />
            <p className="mt-1 text-xs text-black/50">
              Mengubah email akan memperbarui sesi login secara otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Ganti Password */}
      <div className="card p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-black">Ganti Password</h2>
          <p className="mt-0.5 text-xs text-black/50">Kosongkan jika tidak ingin mengganti password.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label-base" htmlFor="current-password">Password lama</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-base"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label-base" htmlFor="new-password">Password baru</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base"
              placeholder="Min. 8 karakter"
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label-base" htmlFor="confirm-password">Konfirmasi password baru</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
              placeholder="Ulangi password baru"
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan perubahan'}
        </button>
      </div>
    </form>
  );
}
