import Link from 'next/link';
import { ChevronRightIcon } from './icons';

export function Breadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex items-center gap-1.5 text-sm text-black/60"
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-navy">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-black' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRightIcon className="h-3.5 w-3.5" />}
          </span>
        );
      })}
    </nav>
  );
}
