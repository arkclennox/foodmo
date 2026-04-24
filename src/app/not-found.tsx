import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section py-20 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-3 text-5xl font-bold text-navy">404</div>
        <h1 className="mb-2 text-2xl font-semibold text-black">Halaman tidak ditemukan</h1>
        <p className="mb-6 text-black/70">
          Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="btn-primary">
            Kembali ke Beranda
          </Link>
          <Link href="/tempat-makan" className="btn-secondary">
            Jelajahi Direktori
          </Link>
        </div>
      </div>
    </div>
  );
}
