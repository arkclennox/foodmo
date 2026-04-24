import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-soft">
      <div className="section grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 text-lg font-semibold text-navy">Direktori Kuliner</div>
          <p className="text-sm text-black/70">
            Temukan restoran, cafe, dan warung makan terbaik di seluruh Indonesia.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-navy">Jelajahi</div>
          <ul className="space-y-2 text-sm text-black/80">
            <li>
              <Link href="/tempat-makan" className="hover:text-navy">
                Direktori
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-navy">
                Blog Kuliner
              </Link>
            </li>
            <li>
              <Link href="/kategori/cafe" className="hover:text-navy">
                Cafe
              </Link>
            </li>
            <li>
              <Link href="/kategori/warung-makan" className="hover:text-navy">
                Warung Makan
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-navy">Kota Populer</div>
          <ul className="space-y-2 text-sm text-black/80">
            <li>
              <Link href="/kota/jakarta" className="hover:text-navy">
                Jakarta
              </Link>
            </li>
            <li>
              <Link href="/kota/bandung" className="hover:text-navy">
                Bandung
              </Link>
            </li>
            <li>
              <Link href="/kota/surabaya" className="hover:text-navy">
                Surabaya
              </Link>
            </li>
            <li>
              <Link href="/kota/yogyakarta" className="hover:text-navy">
                Yogyakarta
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-navy">Perusahaan</div>
          <ul className="space-y-2 text-sm text-black/80">
            <li>
              <Link href="/about" className="hover:text-navy">
                Tentang
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-navy">
                Kontak
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-navy">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-navy">
                Syarat & Ketentuan
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="section flex flex-col items-center justify-between gap-2 py-5 text-xs text-black/60 sm:flex-row">
          <div>© {year} Direktori Kuliner. Semua hak dilindungi.</div>
          <div>Dibuat untuk pecinta kuliner Indonesia.</div>
        </div>
      </div>
    </footer>
  );
}
