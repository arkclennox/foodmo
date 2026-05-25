import Link from 'next/link';
import Image from 'next/image';

const NAV = [
  { href: '/tempat-makan', label: 'Direktori' },
  { href: '/kota', label: 'Kota' },
  { href: '/kategori', label: 'Kategori' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'Tentang' },
  { href: '/contact', label: 'Kontak' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
      <div className="section flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-navy">
          <Image
            src="/logo.png"
            alt="FoodMo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-md"
            priority
          />
          <span className="text-base sm:text-lg">FoodMo</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
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
        <details className="relative lg:hidden">
          <summary className="btn-secondary flex h-10 cursor-pointer list-none items-center gap-2 px-3 [&::-webkit-details-marker]:hidden">
            <span aria-hidden>☰</span>
            <span className="text-sm font-medium">Menu</span>
          </summary>
          <div className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-border bg-white p-2 shadow-card">
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-black/80 transition hover:bg-soft hover:text-navy"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/tempat-makan"
                className="btn-primary mt-2 justify-center"
              >
                Cari Tempat Makan
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
