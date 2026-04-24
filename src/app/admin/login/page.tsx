import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Login Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="section flex min-h-[70vh] max-w-md items-center py-10">
      <div className="w-full">
        <div className="mb-6 text-center">
          <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-navy">
            Dashboard
          </div>
          <h1 className="text-2xl font-semibold text-black">Masuk Admin</h1>
          <p className="mt-1 text-sm text-black/60">
            Gunakan email & password admin untuk mengelola listing dan artikel.
          </p>
        </div>
        <LoginForm nextUrl={next} />
      </div>
    </div>
  );
}
