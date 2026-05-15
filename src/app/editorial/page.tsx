import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Pedoman Editorial',
  description:
    'Bagaimana FoodMo menulis rekomendasi kuliner: standar editorial, sumber data, penanganan konflik kepentingan, dan kebijakan koreksi.',
  path: '/editorial',
});

export default function EditorialPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb
        items={[{ label: 'Beranda', href: '/' }, { label: 'Pedoman Editorial' }]}
      />
      <h1 className="mb-2 text-3xl font-semibold text-black">
        Pedoman Editorial — Cara Kami Menulis Rekomendasi
      </h1>
      <p className="mb-6 text-sm text-black/60">Terakhir diperbarui: 16 Mei 2026</p>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Pedoman ini menjelaskan bagaimana tim FoodMo memilih, memverifikasi, dan menulis
          listing tempat makan serta artikel kuliner. Tujuannya: pembaca tahu dari mana
          informasi berasal dan bagaimana standar kualitas dijaga.
        </p>

        <h2>1. Prinsip Dasar</h2>
        <ul>
          <li>
            <strong>Jujur lebih dari clickbait.</strong> Judul dan deskripsi harus
            merepresentasikan tempat makan apa adanya — tidak melebih-lebihkan atau memojokkan.
          </li>
          <li>
            <strong>Berguna untuk pencari kuliner.</strong> Kami fokus pada informasi praktis:
            apa yang dijual, kisaran harga, suasana, lokasi, jam buka, dan menu unggulan.
          </li>
          <li>
            <strong>Lokal dan kontekstual.</strong> Penulis memahami konteks kota,
            kategori makanan, dan target pembaca — bukan hasil generatif tanpa pengawasan.
          </li>
          <li>
            <strong>Transparan terhadap sumber.</strong> Jika sebuah klaim berasal dari pihak
            ketiga (kunjungan langsung, situs resmi tempat usaha, laporan pembaca), itu
            ditandai sejelas mungkin di teks.
          </li>
        </ul>

        <h2>2. Bagaimana Listing Dipilih</h2>
        <p>Sebuah tempat makan masuk ke direktori melalui salah satu jalur berikut:</p>
        <ol>
          <li>
            <strong>Kurasi tim editorial</strong> — tim mencari tempat makan menarik di kota
            tertentu berdasarkan ulasan publik, tren lokal, dan referensi komunitas.
          </li>
          <li>
            <strong>Pengajuan pemilik usaha</strong> — pemilik mendaftarkan tempatnya melalui{' '}
            <Link href="/contact">form kontak</Link> dengan data lengkap.
          </li>
          <li>
            <strong>Rekomendasi pembaca</strong> — pembaca menyarankan tempat melalui email,
            yang kemudian dilakukan verifikasi lanjutan oleh tim.
          </li>
        </ol>
        <p>
          Semua listing diverifikasi minimum pada: nama resmi, alamat, kategori, dan ada
          tidaknya jejak digital (Google Maps, akun sosial media, atau situs resmi). Listing
          tanpa jejak yang bisa diverifikasi tidak dipublikasikan.
        </p>

        <h2>3. Bagaimana Deskripsi & Artikel Ditulis</h2>
        <ul>
          <li>Setiap teks ditulis dan/atau direview oleh editor manusia.</li>
          <li>
            Penggunaan AI sebagai alat bantu (draft awal, parafrase, ringkasan) diperbolehkan,
            namun keluaran selalu dicek faktual oleh editor sebelum diterbitkan — tidak
            dipublikasikan apa adanya.
          </li>
          <li>
            Klaim subjektif (&quot;paling enak&quot;, &quot;terbaik&quot;) dihindari kecuali
            dilengkapi konteks (mis. survei pembaca, peringkat populer, hasil tasting tim).
          </li>
          <li>
            Tidak ada plagiarisme. Mengutip ulasan publik harus dengan atribusi yang jelas.
          </li>
        </ul>

        <h2>4. Sumber Data</h2>
        <ul>
          <li>Kunjungan langsung tim atau kontributor lokal yang dipercaya.</li>
          <li>Komunikasi langsung dengan pemilik usaha.</li>
          <li>
            Sumber terbuka publik: situs resmi tempat usaha, akun sosial media resmi, Google
            Maps, dan laporan media yang kredibel.
          </li>
          <li>Laporan koreksi dari pembaca yang sudah diverifikasi.</li>
        </ul>

        <h2>5. Konflik Kepentingan</h2>
        <p>
          Jika sebuah artikel atau listing mendapat insentif dari pihak ketiga (sponsor,
          paket Featured berbayar, kunjungan undangan), kami akan menandainya secara jelas
          sebagai <em>Featured</em>, <em>Sponsored</em>, atau <em>Kerja Sama</em>. Pendapatan
          dari sponsor tidak digunakan untuk memanipulasi konten editorial independen yang
          tidak ditandai.
        </p>

        <h2>6. Pembaruan & Kedaluwarsa</h2>
        <p>
          Data jam buka, harga, dan kontak diverifikasi ulang secara berkala (sesuai kapasitas
          tim) dan setiap kali kami menerima laporan koreksi. Tempat yang telah tutup permanen
          ditandai atau dihapus dari direktori, sementara tempat yang sedang renovasi dapat
          diarsipkan sementara.
        </p>

        <h2>7. Koreksi & Klarifikasi</h2>
        <p>
          Kami menyediakan jalur resmi untuk mengoreksi data, baik dari pemilik usaha maupun
          pembaca. Detail lengkap ada di{' '}
          <Link href="/koreksi-data">kebijakan koreksi data</Link>. Kami berkomitmen merespon
          permintaan koreksi dalam <strong>1–3 hari kerja</strong> sejak laporan diterima.
        </p>

        <h2>8. Bahasa & Inklusivitas</h2>
        <ul>
          <li>
            Bahasa Indonesia yang sederhana, sopan, dan netral. Hindari stereotip negatif
            terhadap suku, agama, ras, atau golongan.
          </li>
          <li>Penanda harga gunakan kategori (murah/sedang/mahal/premium) sebagai pendamping.</li>
          <li>
            Foto memperhatikan privasi: hindari menampilkan wajah pelanggan yang dapat
            diidentifikasi tanpa izin.
          </li>
        </ul>

        <h2>9. Penanganan Kesalahan</h2>
        <p>
          Jika kami membuat kesalahan faktual, koreksi dilakukan secepatnya. Untuk perubahan
          signifikan pada artikel yang sudah ditayangkan, kami akan menambahkan catatan
          editorial di akhir artikel berisi tanggal koreksi dan apa yang berubah.
        </p>

        <h2>10. Umpan Balik</h2>
        <p>
          Saran perbaikan pedoman ini sangat kami hargai. Kirim ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a> atau melalui{' '}
          <Link href="/contact">kontak</Link>.
        </p>
      </div>
    </div>
  );
}
