import Link from 'next/link';

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const windowSize = 2;
  const pages: Array<number | '…'> = [];
  const start = Math.max(1, page - windowSize);
  const end = Math.min(totalPages, page + windowSize);
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('…');
  }
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="btn-secondary">
          Sebelumnya
        </Link>
      ) : (
        <span className="btn-secondary cursor-not-allowed opacity-40">Sebelumnya</span>
      )}
      <div className="hidden items-center gap-1 sm:flex">
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`dot-${idx}`} className="px-2 text-black/50">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                p === page
                  ? 'bg-navy text-white'
                  : 'text-black/70 hover:bg-soft hover:text-navy'
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="btn-secondary">
          Selanjutnya
        </Link>
      ) : (
        <span className="btn-secondary cursor-not-allowed opacity-40">Selanjutnya</span>
      )}
    </nav>
  );
}
