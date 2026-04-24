import { getSession } from '@/lib/auth';
import { SITE_NAME } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-black">Settings</h1>
      <div className="card p-5">
        <h2 className="mb-2 text-base font-semibold text-black">Akun saat ini</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-black/60">Email</dt>
            <dd className="text-black">{session?.email ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-black/60">Role</dt>
            <dd className="text-black">{session?.role ?? '—'}</dd>
          </div>
        </dl>
      </div>
      <div className="card p-5">
        <h2 className="mb-2 text-base font-semibold text-black">Site info</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-black/60">Nama</dt>
            <dd className="text-black">{SITE_NAME}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-black/60">Database</dt>
            <dd className="text-black">SQLite (dev) / Postgres (prod)</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-black/50">
          Konfigurasi site lainnya (nama, URL, kredensial) dikontrol via variabel
          environment. Lihat <code className="rounded bg-soft px-1">.env.example</code>.
        </p>
      </div>
    </div>
  );
}
