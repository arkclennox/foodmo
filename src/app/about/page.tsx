import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: `Tentang ${SITE_NAME}`,
  description: `${SITE_NAME} adalah platform informasi kuliner lokal Indonesia — kurasi tempat makan, cafe, dan warung dari berbagai kota, ditulis dengan standar editorial yang jelas.`,
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Tentang' }]} />
      <h1 className="mb-4 text-3xl font-semibold text-black">Tentang FoodMo</h1>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          <strong>FoodMo</strong> adalah platform informasi kuliner lokal Indonesia yang berfokus
          membantu pengunjung menemukan tempat makan yang relevan — mulai dari warung kaki lima,
          kedai kopi, cafe, hingga restoran fine dining di berbagai kota. Kami percaya setiap kota
          punya cerita kuliner yang layak dikenal oleh lebih banyak orang.
        </p>
        <p>
          FoodMo <strong>bukan agregator data restoran otomatis</strong> dan bukan scraper. Setiap
          listing yang kami tampilkan melewati proses verifikasi manual oleh tim editorial, dan
          setiap artikel kuliner ditulis oleh editor yang memahami konteks lokal — bukan
          spinning artikel atau hasil generatif tanpa pengawasan.
        </p>

        <h2>Misi Kami</h2>
        <ul>
          <li>
            <strong>Kurasi yang jujur.</strong> Kami memilih tempat makan yang menarik untuk
            dibahas, lengkap dengan konteks harga, suasana, dan menu unggulan — bukan sekadar
            menampilkan semua tempat.
          </li>
          <li>
            <strong>Informasi yang akurat.</strong> Kami berupaya menjaga kebaruan alamat, jam
            buka, dan kontak dengan jadwal verifikasi berkala dan jalur koreksi terbuka untuk
            pemilik usaha maupun pembaca.
          </li>
          <li>
            <strong>Ramah pencari kuliner lokal.</strong> Setiap halaman kota dan kategori
            dirancang sebagai panduan ringkas, bukan hanya daftar panjang.
          </li>
          <li>
            <strong>Bermanfaat untuk pemilik usaha.</strong> Pemilik warung, cafe, atau restoran
            bisa mengajukan listing baru dan memperbarui informasi melalui jalur kontak kami.
          </li>
        </ul>

        <h2>Standar Editorial</h2>
        <p>
          Konten artikel dan deskripsi listing di FoodMo mengikuti{' '}
          <Link href="/editorial">pedoman editorial</Link> kami: ditulis manusia, dapat
          ditelusuri sumbernya, dan diperbarui ketika ada perubahan signifikan. Untuk mengajukan
          koreksi data tempat makan, lihat{' '}
          <Link href="/koreksi-data">kebijakan koreksi data</Link>.
        </p>

        <h2>Untuk Siapa?</h2>
        <ul>
          <li>Pengunjung yang mencari tempat makan baru di kota mereka atau saat bepergian.</li>
          <li>Food blogger dan kreator konten yang butuh referensi terverifikasi.</li>
          <li>
            Pemilik bisnis kuliner yang ingin tempatnya ditemukan oleh lebih banyak pelanggan
            lokal.
          </li>
        </ul>

        <h2>Cakupan</h2>
        <p>
          FoodMo aktif mengkurasi tempat makan di kota-kota besar Indonesia. Lihat{' '}
          <Link href="/kota">daftar kota</Link> dan{' '}
          <Link href="/kategori">daftar kategori</Link> untuk mulai menelusuri. Cakupan kota dan
          kategori akan terus diperluas seiring bertambahnya tempat yang sudah kami verifikasi.
        </p>

        <h2>Cara Menghubungi Kami</h2>
        <p>
          Untuk pertanyaan, kerja sama, koreksi data, atau pendaftaran listing, silakan kunjungi
          halaman <Link href="/contact">kontak</Link> atau kirim email ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a>. Kami biasanya merespon dalam
          1–3 hari kerja.
        </p>

        <h2>Pengelola</h2>
        <p>
          FoodMo dikelola oleh tim independen yang berbasis di Indonesia. Pendapatan platform
          berasal dari iklan yang relevan dan kemitraan konten — tanpa mengorbankan
          objektivitas editorial. Pemasangan iklan dilakukan dengan transparansi sesuai{' '}
          <Link href="/disclaimer">disclaimer</Link> kami.
        </p>
      </div>
    </div>
  );
}
