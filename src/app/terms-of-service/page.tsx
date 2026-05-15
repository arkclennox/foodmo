import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Syarat & Ketentuan',
  description:
    'Syarat dan ketentuan penggunaan FoodMo: hak kekayaan intelektual, akurasi data, pembatasan tanggung jawab, dan kebijakan listing.',
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
      <h1 className="mb-2 text-3xl font-semibold text-black">Syarat & Ketentuan</h1>
      <p className="mb-6 text-sm text-black/60">Terakhir diperbarui: 16 Mei 2026</p>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Dengan mengakses atau menggunakan website{' '}
          <a href="https://foodmo.id">foodmo.id</a> (&quot;Situs&quot;), Anda setuju terikat
          pada syarat dan ketentuan di bawah ini. Jika Anda tidak setuju, mohon tidak
          menggunakan Situs.
        </p>

        <h2>1. Definisi</h2>
        <ul>
          <li>
            <strong>FoodMo / kami</strong> — pengelola Situs.
          </li>
          <li>
            <strong>Pengguna / Anda</strong> — siapa pun yang mengakses Situs.
          </li>
          <li>
            <strong>Listing</strong> — entri tempat makan (restoran, cafe, warung) yang
            ditampilkan di Situs.
          </li>
          <li>
            <strong>Konten</strong> — seluruh teks, gambar, deskripsi, dan artikel yang
            ditampilkan di Situs.
          </li>
        </ul>

        <h2>2. Penggunaan yang Diperbolehkan</h2>
        <p>
          Anda boleh mengakses Konten untuk keperluan pribadi dan non-komersial. Anda boleh
          membagikan tautan ke halaman Situs di sosial media atau platform lain selama tidak
          mengubah konteks.
        </p>

        <h2>3. Penggunaan yang Dilarang</h2>
        <ul>
          <li>
            Menyalin, mendistribusikan ulang, atau memodifikasi Konten dalam jumlah besar tanpa
            izin tertulis dari kami.
          </li>
          <li>
            Melakukan scraping otomatis, crawling agresif, atau aktivitas lain yang
            membebani server di luar perilaku pengguna normal.
          </li>
          <li>Menggunakan Situs untuk tujuan ilegal, melecehkan, atau menyebar spam.</li>
          <li>
            Mencoba mengakses area admin, mengeksploitasi kerentanan, atau melakukan reverse
            engineering terhadap kode/desain Situs.
          </li>
        </ul>

        <h2>4. Akurasi Informasi & Disclaimer</h2>
        <p>
          Kami berupaya menjaga keakuratan data listing (alamat, jam buka, harga, fasilitas)
          dan artikel. Namun, informasi dapat berubah sewaktu-waktu di luar kontrol kami.{' '}
          <strong>
            Selalu lakukan konfirmasi langsung kepada tempat usaha untuk informasi penting
          </strong>{' '}
          sebelum berkunjung. Lihat <Link href="/disclaimer">disclaimer</Link> untuk detail
          tambahan.
        </p>

        <h2>5. Konten Pengguna</h2>
        <p>
          Pesan yang Anda kirim melalui form kontak, termasuk saran dan koreksi data, dianggap
          memberikan kami lisensi non-eksklusif untuk menggunakan informasi tersebut demi
          perbaikan Situs. Kami tidak diwajibkan menerbitkan atau menanggapi setiap pesan.
        </p>

        <h2>6. Hak Kekayaan Intelektual</h2>
        <p>
          Logo, desain, tata letak, dan teks yang dikurasi tim editorial adalah milik FoodMo
          atau lisensornya. Sebagian foto dan informasi tempat makan mungkin merupakan milik
          pemilik usaha atau pihak ketiga; kami menampilkannya untuk tujuan informasi dengan
          itikad baik. Jika Anda adalah pemilik hak dan ingin konten tertentu dihapus, lihat
          bagian 10.
        </p>

        <h2>7. Iklan & Tautan Pihak Ketiga</h2>
        <p>
          Situs dapat menampilkan iklan dari Google AdSense dan/atau mitra lain, serta tautan
          ke situs pihak ketiga (sosial media, layanan pesan, peta). Kami tidak bertanggung
          jawab atas konten, kebijakan privasi, atau praktik pihak ketiga.
        </p>

        <h2>8. Pembatasan Tanggung Jawab</h2>
        <p>
          FoodMo tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang
          timbul dari penggunaan informasi di Situs, termasuk namun tidak terbatas pada:
          kesalahan jam buka, perubahan harga, ketersediaan menu, kualitas pelayanan tempat
          usaha, atau perubahan lokasi.
        </p>

        <h2>9. Listing Tempat Makan</h2>
        <ul>
          <li>
            Pemilik usaha dapat mengajukan listing baru atau perbaikan listing yang ada melalui{' '}
            <Link href="/contact">kontak</Link>.
          </li>
          <li>
            Kami berhak menolak, mengedit, atau menghapus listing yang tidak sesuai dengan
            standar editorial kami.
          </li>
          <li>Pemuatan listing tidak dipungut biaya, kecuali untuk paket Featured (jika berlaku).</li>
        </ul>

        <h2>10. Permintaan Penghapusan / Takedown</h2>
        <p>
          Permintaan penghapusan listing, koreksi, atau klaim hak kekayaan intelektual dapat
          dikirim ke <a href="mailto:hello@foodmo.id">hello@foodmo.id</a> dengan bukti
          pendukung. Lihat juga{' '}
          <Link href="/koreksi-data">kebijakan koreksi data</Link>.
        </p>

        <h2>11. Perubahan Layanan</h2>
        <p>
          Kami dapat memodifikasi, menangguhkan, atau menghentikan sebagian/seluruh layanan
          sewaktu-waktu tanpa pemberitahuan sebelumnya.
        </p>

        <h2>12. Hukum yang Berlaku</h2>
        <p>
          Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan akan
          diupayakan diselesaikan secara musyawarah; jika tidak tercapai, dapat diselesaikan
          melalui pengadilan yang berwenang di Indonesia.
        </p>

        <h2>13. Perubahan Ketentuan</h2>
        <p>
          Ketentuan ini dapat diperbarui sewaktu-waktu. Versi terbaru berlaku sejak
          dipublikasikan di halaman ini. Melanjutkan menggunakan Situs setelah perubahan
          berarti Anda menerima ketentuan yang diperbarui.
        </p>

        <h2>14. Kontak</h2>
        <p>
          Pertanyaan terkait syarat ini dapat dikirim ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a>.
        </p>
      </div>
    </div>
  );
}
