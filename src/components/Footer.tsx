import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-border bg-soft">
      <div className="section grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="mb-3 text-lg font-semibold text-navy">FoodMo</div>
          <p className="text-sm text-black/70">
            Platform informasi kuliner lokal Indonesia. Setiap listing dikurasi tim editorial —
            bukan scraper otomatis.
          </p>
          <p className="mt-3 text-sm text-black/70">
            <a href="mailto:hello@foodmo.id" className="text-navy hover:underline">
              hello@foodmo.id
            </a>
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
              <Link href="/kota" className="hover:text-navy">
                Semua Kota
              </Link>
            </li>
            <li>
              <Link href="/kategori" className="hover:text-navy">
                Semua Kategori
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-navy">
                Blog Kuliner
              </Link>
            </li>
            <li>
              <Link href="/peta-situs" className="hover:text-navy">
                Peta Situs
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
              <Link href="/editorial" className="hover:text-navy">
                Pedoman Editorial
              </Link>
            </li>
            <li>
              <Link href="/koreksi-data" className="hover:text-navy">
                Kebijakan Koreksi Data
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold text-navy">Legal</div>
          <ul className="space-y-2 text-sm text-black/80">
            <li>
              <Link href="/privacy-policy" className="hover:text-navy">
                Kebijakan Privasi
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-navy">
                Syarat &amp; Ketentuan
              </Link>
            </li>
            <li>
              <Link href="/disclaimer" className="hover:text-navy">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="section flex flex-col items-center justify-between gap-2 py-5 text-xs text-black/60 sm:flex-row">
          <div>© {year} FoodMo. Semua hak dilindungi.</div>
          <div>Dibuat untuk pecinta kuliner Indonesia.</div>
        </div>
      </div>
    </footer>
  );
}
