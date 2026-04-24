import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan website Direktori Kuliner.',
  path: '/terms-of-service',
});

export default function TermsPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Syarat & Ketentuan' },
        ]}
      />
      <h1 className="mb-4 text-3xl font-semibold text-black">Syarat & Ketentuan</h1>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Dengan mengakses Direktori Kuliner, Anda setuju untuk mematuhi syarat
          dan ketentuan berikut.
        </p>
        <h2>Penggunaan Konten</h2>
        <p>
          Seluruh konten adalah milik Direktori Kuliner atau pemilik yang sah.
          Anda dilarang menyalin, mendistribusikan ulang, atau memodifikasi
          konten tanpa izin tertulis.
        </p>
        <h2>Akurasi Informasi</h2>
        <p>
          Kami berupaya menjaga keakuratan data listing dan artikel, namun
          tidak menjamin 100% bebas dari kesalahan. Harap lakukan konfirmasi
          ulang kepada tempat usaha untuk informasi penting (jam buka, harga,
          ketersediaan menu).
        </p>
        <h2>Pembatasan Tanggung Jawab</h2>
        <p>
          Direktori Kuliner tidak bertanggung jawab atas kerugian langsung
          maupun tidak langsung yang timbul dari penggunaan informasi di
          website.
        </p>
        <h2>Perubahan Ketentuan</h2>
        <p>
          Ketentuan dapat diperbarui sewaktu-waktu. Versi terbaru berlaku sejak
          dipublikasikan di halaman ini.
        </p>
      </div>
    </div>
  );
}
