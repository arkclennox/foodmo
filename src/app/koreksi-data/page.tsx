import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Kebijakan Koreksi Data',
  description:
    'Cara mengajukan koreksi data tempat makan, takedown, atau klaim kepemilikan listing di FoodMo. Jalur resmi, dokumen yang diperlukan, dan waktu respons.',
  path: '/koreksi-data',
});

export default function CorrectionPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb
        items={[{ label: 'Beranda', href: '/' }, { label: 'Kebijakan Koreksi Data' }]}
      />
      <h1 className="mb-2 text-3xl font-semibold text-black">
        Kebijakan Koreksi Data Tempat Makan
      </h1>
      <p className="mb-6 text-sm text-black/60">Terakhir diperbarui: 16 Mei 2026</p>
      <div className="prose prose-navy max-w-none text-black/80">
        <p>
          Kami berkomitmen menjaga data tempat makan di FoodMo seakurat mungkin. Halaman ini
          menjelaskan cara mengajukan koreksi data, takedown, atau klaim kepemilikan listing —
          baik untuk pemilik usaha maupun pembaca umum.
        </p>

        <h2>1. Apa yang Bisa Dikoreksi</h2>
        <ul>
          <li>Nama tempat (jika salah eja atau berubah).</li>
          <li>Alamat, koordinat lokasi, kota/provinsi.</li>
          <li>Jam buka & hari operasional.</li>
          <li>Nomor telepon, WhatsApp, kontak online (Instagram, TikTok, Shopee Food).</li>
          <li>Kisaran harga, fasilitas, dan menu unggulan.</li>
          <li>Foto featured & galeri.</li>
          <li>Status: aktif, sedang renovasi, atau telah tutup permanen.</li>
          <li>Kategori (mis. dari &quot;Cafe&quot; menjadi &quot;Cafe + Restoran&quot;).</li>
        </ul>

        <h2>2. Siapa yang Bisa Mengajukan</h2>
        <ul>
          <li>
            <strong>Pemilik usaha / penanggung jawab resmi</strong> — dengan bukti
            kepemilikan (lihat bagian 4).
          </li>
          <li>
            <strong>Karyawan terotorisasi</strong> dari tempat usaha tersebut.
          </li>
          <li>
            <strong>Pembaca umum</strong> yang menemukan data tidak akurat saat berkunjung.
            Permintaan akan diverifikasi tim sebelum dieksekusi.
          </li>
        </ul>

        <h2>3. Cara Mengajukan</h2>
        <ol>
          <li>
            Kirim email ke{' '}
            <a href="mailto:hello@foodmo.id?subject=Koreksi%20Data">hello@foodmo.id</a> dengan
            subjek <strong>&quot;Koreksi Data: [nama tempat]&quot;</strong>.
          </li>
          <li>
            Atau gunakan <Link href="/contact">form kontak</Link> dengan kategori
            &quot;Koreksi Data&quot;.
          </li>
          <li>
            Sertakan link halaman listing di FoodMo yang ingin dikoreksi (mis.{' '}
            <code>foodmo.id/tempat-makan/nama-tempat</code>).
          </li>
          <li>
            Jelaskan data lama vs data baru. Untuk perubahan jam buka, sertakan jadwal
            terbaru per hari.
          </li>
          <li>Lampirkan bukti pendukung (lihat bagian 4).</li>
        </ol>

        <h2>4. Dokumen Pendukung</h2>
        <p>Tergantung jenis koreksi, kami dapat meminta salah satu dokumen berikut:</p>
        <ul>
          <li>
            <strong>Perubahan alamat / nama / kepemilikan</strong> — foto papan nama,
            tampilan depan, atau surat usaha (NPWP/NIB/SIUP).
          </li>
          <li>
            <strong>Perubahan jam buka & harga</strong> — screenshot dari sumber resmi (akun
            sosial media resmi tempat usaha, situs resmi, atau pesan dari pengelola).
          </li>
          <li>
            <strong>Foto baru</strong> — file foto dalam resolusi minimum 1200×800 px, dan
            keterangan bahwa Anda berhak menggunakannya.
          </li>
          <li>
            <strong>Klaim kepemilikan listing</strong> — bukti bahwa Anda adalah pemilik atau
            penanggung jawab usaha (surat usaha, kartu identitas yang disensor sebagian, atau
            verifikasi melalui akun sosial media resmi tempat usaha).
          </li>
          <li>
            <strong>Permintaan tutup permanen</strong> — foto kondisi tempat dan/atau
            pernyataan resmi pemilik.
          </li>
        </ul>

        <h2>5. Waktu Respons</h2>
        <ul>
          <li>
            <strong>Penerimaan laporan</strong>: konfirmasi diterima dalam 1–3 hari kerja.
          </li>
          <li>
            <strong>Verifikasi & eksekusi</strong>: 3–10 hari kerja tergantung kompleksitas
            (perubahan sederhana lebih cepat).
          </li>
          <li>
            <strong>Permintaan urgent</strong> (mis. tempat sudah tutup permanen, data
            sangat menyesatkan) diprioritaskan untuk diselesaikan dalam 48 jam.
          </li>
        </ul>

        <h2>6. Permintaan Penghapusan (Takedown)</h2>
        <p>
          Pemilik usaha dapat meminta listing dihapus seluruhnya dengan alasan: tempat sudah
          tidak beroperasi, perubahan nama signifikan, atau alasan lain yang sah. Permintaan
          takedown mengikuti prosedur yang sama dengan koreksi, ditambah pernyataan
          permohonan penghapusan dari pihak yang berwenang.
        </p>
        <p>
          Untuk klaim hak kekayaan intelektual (foto, logo, deskripsi), lihat juga bagian 10
          pada <Link href="/terms-of-service">syarat &amp; ketentuan</Link>.
        </p>

        <h2>7. Jika Permintaan Ditolak</h2>
        <p>Permintaan dapat ditolak atau ditunda jika:</p>
        <ul>
          <li>Bukti tidak memadai atau tidak konsisten dengan sumber publik.</li>
          <li>
            Permintaan datang dari pihak yang tidak dapat diverifikasi sebagai pemilik / pelapor
            yang sah.
          </li>
          <li>
            Permintaan bertentangan dengan kepentingan publik (mis. menyembunyikan informasi
            penting tanpa alasan yang jelas).
          </li>
        </ul>
        <p>
          Kami akan menjelaskan alasan penolakan dan memberi peluang banding melalui email
          yang sama.
        </p>

        <h2>8. Privasi Pelapor</h2>
        <p>
          Identitas pelapor dijaga kerahasiaannya dan tidak diungkapkan kepada pihak yang
          dikoreksi, kecuali atas izin pelapor atau diwajibkan oleh hukum.
        </p>

        <h2>9. Kontak</h2>
        <p>
          Pertanyaan terkait kebijakan ini dapat dikirim ke{' '}
          <a href="mailto:hello@foodmo.id">hello@foodmo.id</a>.
        </p>
      </div>
    </div>
  );
}
