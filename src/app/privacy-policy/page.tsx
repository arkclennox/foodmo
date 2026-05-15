import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi FoodMo: data yang kami kumpulkan, cookies, pihak ketiga (Google Analytics, Google AdSense), dan hak Anda atas data pribadi.',
  path: '/privacy-policy',
});

export default function PrivacyPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kebijakan Privasi' }]} />
      <h1 className="mb-2 text-3xl font-semibold text-black">Kebijakan Privasi</h1>
      <p className="mb-6 text-sm text-black/60">Terakhir diperbarui: 16 Mei 2026</p>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Kebijakan ini menjelaskan bagaimana <strong>FoodMo</strong> (selanjutnya
          &quot;kami&quot;) mengumpulkan, menggunakan, menyimpan, dan melindungi data pengunjung
          situs <a href="https://foodmo.id">foodmo.id</a> (selanjutnya &quot;Situs&quot;).
          Dengan mengakses Situs, Anda dianggap menyetujui ketentuan di bawah ini.
        </p>

        <h2>1. Data yang Kami Kumpulkan</h2>
        <ul>
          <li>
            <strong>Data yang Anda berikan secara aktif</strong> melalui form kontak: nama,
            alamat email, subjek, dan isi pesan.
          </li>
          <li>
            <strong>Data teknis otomatis</strong>: alamat IP, jenis browser, sistem operasi,
            referrer, halaman yang dikunjungi, durasi kunjungan, dan timestamp. Data ini
            dikumpulkan melalui log server dan layanan analitik pihak ketiga.
          </li>
          <li>
            <strong>Cookies dan teknologi serupa</strong> untuk menjaga sesi, mengingat
            preferensi, dan menjalankan analitik serta iklan (lihat bagian 4).
          </li>
        </ul>

        <h2>2. Bagaimana Kami Menggunakan Data</h2>
        <ul>
          <li>Menjalankan dan menjaga keamanan Situs.</li>
          <li>Menjawab pertanyaan, permintaan kerja sama, dan permintaan koreksi data.</li>
          <li>Mengukur traffic, memahami perilaku pembaca, dan memperbaiki konten.</li>
          <li>Menampilkan iklan yang relevan melalui Google AdSense.</li>
          <li>Memenuhi kewajiban hukum yang berlaku di Indonesia.</li>
        </ul>

        <h2>3. Dasar Hukum & Persetujuan</h2>
        <p>
          Kami memproses data berdasarkan kepentingan sah (legitimate interest) untuk
          mengoperasikan Situs, dan berdasarkan persetujuan Anda saat menggunakan Situs atau
          mengirimkan form. Anda dapat mencabut persetujuan kapan saja dengan menghubungi{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a>.
        </p>

        <h2>4. Cookie & Pihak Ketiga</h2>
        <p>
          Situs menggunakan layanan pihak ketiga berikut yang masing-masing memiliki kebijakan
          privasinya sendiri:
        </p>
        <ul>
          <li>
            <strong>Google Analytics</strong> — analitik traffic (anonim). Lihat{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer noopener"
            >
              kebijakan privasi Google
            </a>
            .
          </li>
          <li>
            <strong>Google AdSense</strong> — menampilkan iklan. Google dan mitranya dapat
            menggunakan cookies untuk menayangkan iklan berdasarkan kunjungan Anda ke Situs dan
            situs lain di internet. Anda dapat menonaktifkan iklan yang dipersonalisasi dengan
            mengunjungi{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noreferrer noopener"
            >
              Pengaturan Iklan Google
            </a>
            .
          </li>
          <li>
            <strong>Google Maps / penyedia peta</strong> — embed lokasi tempat makan.
          </li>
          <li>
            <strong>Hosting</strong> — server dan CDN yang dapat memproses metadata teknis
            seperti alamat IP demi keamanan dan kinerja.
          </li>
        </ul>
        <p>
          Sebagian besar browser memungkinkan Anda mengontrol cookies melalui pengaturan
          browser. Memblokir cookies dapat mempengaruhi pengalaman menggunakan Situs.
        </p>

        <h2>5. Penyimpanan Data</h2>
        <p>
          Pesan yang dikirim melalui form kontak disimpan selama maksimum 24 bulan untuk
          keperluan audit dan komunikasi lanjutan. Data analitik agregat disimpan sesuai
          retensi default penyedia layanan analitik. Anda dapat meminta penghapusan data
          pribadi kapan saja.
        </p>

        <h2>6. Hak Anda</h2>
        <ul>
          <li>Akses terhadap data pribadi yang kami simpan tentang Anda.</li>
          <li>Permintaan koreksi data yang tidak akurat.</li>
          <li>Permintaan penghapusan data (right to be forgotten).</li>
          <li>Penolakan terhadap pemrosesan data tertentu, termasuk iklan personalisasi.</li>
        </ul>
        <p>
          Untuk mengajukan permintaan tersebut, kirim email ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a> dengan subjek &quot;Permintaan
          Data Pribadi&quot;.
        </p>

        <h2>7. Anak di Bawah Umur</h2>
        <p>
          Situs ini ditujukan untuk pengunjung berusia 13 tahun ke atas. Kami tidak secara
          sengaja mengumpulkan data dari anak di bawah usia tersebut. Jika Anda mengetahui hal
          ini terjadi, mohon hubungi kami agar data dapat dihapus.
        </p>

        <h2>8. Keamanan</h2>
        <p>
          Kami menerapkan praktik keamanan yang wajar (HTTPS, hashing password admin, kontrol
          akses) untuk melindungi data. Namun tidak ada sistem yang sepenuhnya aman; kami tidak
          bisa menjamin keamanan absolut.
        </p>

        <h2>9. Perubahan Kebijakan</h2>
        <p>
          Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di
          halaman ini dengan tanggal pembaruan di bagian atas. Perubahan signifikan akan
          diumumkan melalui notifikasi di Situs.
        </p>

        <h2>10. Kontak</h2>
        <p>
          Pertanyaan tentang kebijakan ini dapat dikirim ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a> atau melalui halaman{' '}
          <Link href="/contact">kontak</Link>.
        </p>
      </div>
    </div>
  );
}
