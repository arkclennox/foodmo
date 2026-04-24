import Link from 'next/link';
import { UtensilsIcon } from './icons';

const NAV = [
  { href: '/tempat-makan', label: 'Direktori' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'Tentang' },
  { href: '/contact', label: 'Kontak' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="section flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-white">
            <UtensilsIcon className="h-5 w-5" />
          </span>
          <span className="text-base sm:text-lg">Direktori Kuliner</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-black/80 transition hover:bg-soft hover:text-navy"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/tempat-makan" className="btn-primary ml-2">
            Cari Tempat Makan
          </Link>
        </nav>
        <Link href="/tempat-makan" className="btn-primary md:hidden">
          Cari
        </Link>
      </div>
    </header>
  );
}
