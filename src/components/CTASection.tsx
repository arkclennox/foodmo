import Link from 'next/link';

export function CTASection() {
  return (
    <section className="section my-12">
      <div className="rounded-2xl bg-navy px-6 py-10 text-white sm:px-10">
        <div className="grid items-center gap-6 md:grid-cols-[1.3fr,1fr]">
          <div>
            <h3 className="text-2xl font-semibold sm:text-3xl">
              Punya restoran, cafe, atau warung makan?
            </h3>
            <p className="mt-2 text-white/80">
              Daftarkan tempat usaha Anda ke FoodMo agar ditemukan
              oleh ribuan pencari kuliner di seluruh Indonesia.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-navy transition hover:bg-white/90"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
