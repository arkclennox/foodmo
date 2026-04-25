'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function Pagination({ total, limit, page }: { total: number; limit: number; page: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1 && total > 0) return (
    <div className="flex items-center justify-between mt-4 text-sm text-black/60 bg-white p-3 rounded-xl border border-border shadow-sm">
      Menampilkan semua {total} data
    </div>
  );

  if (total === 0) return null;

  const navigate = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 text-sm text-black/60 bg-white p-3 rounded-xl border border-border shadow-sm">
      <div>
        Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} data
      </div>
      <div className="flex gap-2 items-center">
        <button
          disabled={page <= 1}
          onClick={() => navigate(page - 1)}
          className="px-3 py-1 bg-gray-100 text-black hover:bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <div className="px-3 py-1 font-medium">
          Halaman {page} dari {totalPages}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => navigate(page + 1)}
          className="px-3 py-1 bg-gray-100 text-black hover:bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
