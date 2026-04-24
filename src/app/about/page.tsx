import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `Tentang ${SITE_NAME}`,
  description: `Tentang FoodMo — misi dan manfaat platform bagi pencari kuliner dan pemilik usaha.`,
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Tentang' }]} />
      <h1 className="mb-4 text-3xl font-semibold text-black">Tentang FoodMo</h1>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          FoodMo adalah platform directory yang dirancang untuk
          membantu pengunjung menemukan restoran, cafe, dan warung makan
          terbaik di seluruh Indonesia. Kami percaya bahwa setiap kota memiliki
          cerita kuliner yang layak dibagikan — mulai dari warung kaki lima
          legendaris, kedai kopi kekinian, hingga restoran fine dining.
        </p>
        <h2>Misi Kami</h2>
        <ul>
          <li>Memberikan rekomendasi kuliner yang jelas, jujur, dan relevan.</li>
          <li>Membantu pemilik usaha kuliner ditemukan oleh lebih banyak pelanggan.</li>
          <li>
            Menyediakan konten artikel kuliner berkualitas untuk membantu
            pembaca merencanakan kunjungan mereka.
          </li>
        </ul>
        <h2>Untuk Siapa?</h2>
        <p>
          FoodMo ditujukan untuk pengunjung umum, food blogger, dan
          pemilik bisnis kuliner. Jika Anda ingin listing tempat usaha Anda
          tampil di sini, silakan hubungi tim kami melalui halaman kontak.
        </p>
      </div>
    </div>
  );
}
