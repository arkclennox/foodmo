import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SITE_NAME } from '@/lib/seo';
import { AdminProfileForm } from '@/components/admin/AdminProfileForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();

  // Fetch current admin data from DB for pre-filling the form
  const user = session
    ? await prisma.user.findUnique({
        where: { id: session.sub },
        select: { name: true, email: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-black">Settings</h1>

      <AdminProfileForm
        initialName={user?.name ?? ''}
        initialEmail={user?.email ?? session?.email ?? ''}
      />

      <div className="card p-5">
        <h2 className="mb-2 text-base font-semibold text-black">Site info</h2>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-black/60">Nama site</dt>
            <dd className="text-black">{SITE_NAME}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-black/60">Database</dt>
            <dd className="text-black">PostgreSQL (Neon)</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-black/50">
          Konfigurasi site lainnya (URL, API key) dikontrol via variabel environment.
          Lihat <code className="rounded bg-soft px-1">.env.example</code>.
        </p>
      </div>
    </div>
  );
}
