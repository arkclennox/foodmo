'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LogOutIcon } from '@/components/icons';

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function onLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    startTransition(() => {
      router.replace('/admin/login');
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={pending}
      className="btn-secondary"
    >
      <LogOutIcon className="h-4 w-4" />
      Keluar
    </button>
  );
}
