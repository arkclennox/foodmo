import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi dan penggunaan data pengguna di Direktori Kuliner.',
  path: '/privacy-policy',
});

export default function PrivacyPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kebijakan Privasi' }]} />
      <h1 className="mb-4 text-3xl font-semibold text-black">Kebijakan Privasi</h1>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Kebijakan ini menjelaskan bagaimana Direktori Kuliner mengumpulkan,
          menggunakan, dan melindungi data pengguna. Dengan menggunakan website
          kami, Anda menyetujui ketentuan di bawah ini.
        </p>
        <h2>Data yang Kami Kumpulkan</h2>
        <ul>
          <li>Data yang Anda kirim melalui form kontak (nama, email, pesan).</li>
          <li>Data teknis seperti alamat IP dan user agent untuk analitik.</li>
          <li>Cookie teknis untuk menjaga sesi dan meningkatkan pengalaman.</li>
        </ul>
        <h2>Penggunaan Data</h2>
        <p>
          Data digunakan untuk menjalankan layanan, memperbaiki website, dan
          merespon pertanyaan Anda. Kami tidak menjual data pribadi Anda ke
          pihak ketiga.
        </p>
        <h2>Pihak Ketiga</h2>
        <p>
          Kami dapat menggunakan layanan pihak ketiga (hosting, analitik, peta)
          yang memiliki kebijakan privasi sendiri. Gunakan secukupnya.
        </p>
        <h2>Perubahan Kebijakan</h2>
        <p>
          Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru akan
          selalu tersedia di halaman ini.
        </p>
      </div>
    </div>
  );
}
