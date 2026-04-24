import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminLogoutButton } from '@/components/admin/AdminLogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="bg-soft/50 min-h-screen">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
        <AdminSidebar />
        <div className="flex-1">
          <header className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-5 py-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Dashboard
              </div>
              <div className="text-lg font-semibold text-black">FoodMo Admin</div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href="/" className="btn-ghost">
                Lihat website
              </Link>
              <div className="hidden text-right sm:block">
                <div className="text-xs text-black/50">Masuk sebagai</div>
                <div className="font-medium text-black">{session.email}</div>
              </div>
              <AdminLogoutButton />
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
