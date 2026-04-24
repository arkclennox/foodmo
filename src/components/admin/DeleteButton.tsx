'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { TrashIcon } from '@/components/icons';

export function DeleteButton({
  endpoint,
  confirmText,
  redirectTo,
  label = 'Hapus',
}: {
  endpoint: string;
  confirmText: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(confirmText)) return;
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = (await res.json().catch(() => ({ success: false }))) as {
        success: boolean;
        error?: { message?: string };
      };
      if (!res.ok || !data.success) {
        alert(data.error?.message ?? 'Gagal menghapus');
        return;
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="btn-danger"
    >
      <TrashIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
