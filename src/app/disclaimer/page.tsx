import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Disclaimer',
  description:
    'Disclaimer FoodMo terkait akurasi informasi kuliner, tanggung jawab, afiliasi, dan transparansi iklan AdSense.',
  path: '/disclaimer',
});

export default function DisclaimerPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Disclaimer' }]} />
      <h1 className="mb-2 text-3xl font-semibold text-black">Disclaimer</h1>
      <p className="mb-6 text-sm text-black/60">Terakhir diperbarui: 16 Mei 2026</p>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Halaman ini menjelaskan batasan tanggung jawab <strong>FoodMo</strong> dan posisi
          kami terkait konten, kerja sama, serta iklan yang ditampilkan di Situs.
        </p>

        <h2>1. Akurasi Informasi</h2>
        <p>
          Seluruh informasi di Situs — termasuk alamat, jam buka, nomor telepon, harga rata-rata,
          menu, fasilitas, dan deskripsi tempat makan — disajikan dengan itikad baik dan upaya
          verifikasi yang wajar. Namun:
        </p>
        <ul>
          <li>Informasi dapat berubah sewaktu-waktu di luar kontrol kami.</li>
          <li>
            Foto, rating, dan ulasan mencerminkan kondisi pada saat data dikumpulkan, dan
            mungkin tidak sepenuhnya mewakili pengalaman Anda.
          </li>
          <li>
            Sebelum berkunjung, kami sarankan untuk melakukan konfirmasi langsung kepada
            tempat usaha terkait jam operasional, ketersediaan menu, harga terkini, dan
            kebijakan reservasi.
          </li>
        </ul>

        <h2>2. Bukan Saran Profesional</h2>
        <p>
          Konten di FoodMo bersifat informasi umum untuk membantu pencarian tempat makan dan
          referensi kuliner. Bukan saran medis, gizi, atau profesional lain. Untuk kebutuhan
          khusus (alergi, diet medis, dsb.), konsultasikan dengan profesional yang relevan dan
          konfirmasi langsung dengan tempat usaha.
        </p>

        <h2>3. Pembatasan Tanggung Jawab</h2>
        <p>
          FoodMo tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang
          timbul dari penggunaan informasi di Situs, termasuk namun tidak terbatas pada:
          ketidaktepatan jam buka, perubahan menu/harga, kualitas pelayanan tempat usaha,
          keracunan makanan, atau dampak finansial dari keputusan berdasarkan informasi di
          Situs. Lihat juga{' '}
          <Link href="/terms-of-service">syarat &amp; ketentuan</Link>.
        </p>

        <h2>4. Tautan ke Pihak Ketiga</h2>
        <p>
          Situs memuat tautan ke pihak ketiga seperti Google Maps, akun sosial media, layanan
          pesan online (Shopee Food, GoFood, TikTok, dsb.), dan website resmi tempat usaha.
          Kami tidak mengontrol konten, kebijakan privasi, atau praktik pihak ketiga tersebut
          dan tidak bertanggung jawab atas apa pun yang terjadi di luar Situs.
        </p>

        <h2>5. Iklan & Transparansi AdSense</h2>
        <p>
          FoodMo menampilkan iklan dari <strong>Google AdSense</strong> dan/atau mitra iklan
          lain. Iklan-iklan tersebut:
        </p>
        <ul>
          <li>Ditampilkan secara terpisah dari konten editorial.</li>
          <li>
            Dapat dipersonalisasi berdasarkan riwayat penelusuran Anda. Lihat{' '}
            <Link href="/privacy-policy">kebijakan privasi</Link> untuk opsi opt-out.
          </li>
          <li>
            Tidak diendors oleh tim editorial kami. Munculnya sebuah brand di iklan bukan
            berarti kami merekomendasikannya.
          </li>
        </ul>

        <h2>6. Konten Sponsor & Afiliasi</h2>
        <p>
          Beberapa listing atau artikel dapat berstatus <em>Featured</em>, <em>Sponsored</em>,
          atau mengandung tautan afiliasi. Kami berkomitmen menandai konten semacam itu secara
          jelas sehingga pembaca dapat membedakannya dari konten editorial independen.
          Pendapatan dari sponsor/afiliasi tidak mempengaruhi opini editorial pada konten yang
          tidak ditandai.
        </p>

        <h2>7. Penggunaan Foto & Merek Dagang</h2>
        <p>
          Sebagian foto dan logo tempat usaha digunakan untuk tujuan identifikasi dan
          informasi. Hak cipta dan merek dagang tetap menjadi milik pemilik usaha
          masing-masing. Jika Anda adalah pemilik dan keberatan dengan penggunaan tertentu,
          silakan kirim permintaan ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a>.
        </p>

        <h2>8. Perubahan Disclaimer</h2>
        <p>
          Disclaimer ini dapat diperbarui kapan saja. Versi terbaru selalu tersedia di halaman
          ini dengan tanggal pembaruan di bagian atas.
        </p>

        <h2>9. Kontak</h2>
        <p>
          Pertanyaan terkait disclaimer ini dapat dikirim ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a> atau melalui halaman{' '}
          <Link href="/contact">kontak</Link>.
        </p>
      </div>
    </div>
  );
}
