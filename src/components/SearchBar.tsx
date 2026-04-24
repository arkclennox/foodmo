import Link from 'next/link';
import { SearchIcon } from './icons';

export function SearchBar({
  placeholder = 'Cari restoran, cafe, warung, atau kota…',
  action = '/tempat-makan',
  defaultValue = '',
  size = 'md',
}: {
  placeholder?: string;
  action?: string;
  defaultValue?: string;
  size?: 'md' | 'lg';
}) {
  const heightClass = size === 'lg' ? 'h-14 text-base' : 'h-12 text-sm';
  return (
    <form
      action={action}
      method="get"
      className="flex w-full items-center gap-2 rounded-xl border border-border bg-white p-2 shadow-card"
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <SearchIcon className="h-5 w-5 text-navy" />
        <input
          type="search"
          name="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={`w-full bg-transparent text-black placeholder:text-black/40 focus:outline-none ${heightClass}`}
        />
      </div>
      <button type="submit" className="btn-primary h-11 px-5">
        Cari
      </button>
    </form>
  );
}

export function CategoryQuickLinks() {
  const items = [
    { href: '/kategori/restoran', label: 'Restoran' },
    { href: '/kategori/cafe', label: 'Cafe' },
    { href: '/kategori/warung-makan', label: 'Warung Makan' },
    { href: '/kategori/seafood', label: 'Seafood' },
    { href: '/kategori/bakso', label: 'Bakso' },
    { href: '/kategori/mie-ayam', label: 'Mie Ayam' },
    { href: '/kategori/nasi-goreng', label: 'Nasi Goreng' },
    { href: '/kategori/kopi', label: 'Kopi' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-navy transition hover:border-navy hover:bg-navy/5"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
