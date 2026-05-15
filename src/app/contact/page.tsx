import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = buildMetadata({
  title: 'Kontak',
  description: 'Hubungi tim FoodMo untuk kerja sama, pendaftaran listing, koreksi data, atau pertanyaan umum.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kontak' }]} />
      <h1 className="mb-3 text-3xl font-semibold text-black">Hubungi Kami</h1>
      <p className="mb-8 max-w-2xl text-black/70">
        Punya pertanyaan, ingin mendaftarkan tempat usaha, ingin mengoreksi data tempat makan,
        atau tertarik untuk bekerja sama? Isi form berikut atau kirim email langsung. Kami
        biasanya merespon dalam <strong>1–3 hari kerja</strong>.
      </p>
      <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
        <ContactForm />
        <aside className="card space-y-5 p-5 text-sm">
          <div>
            <div className="font-semibold text-black">Email Umum</div>
            <a href="mailto:hello@foodmo.id" className="text-navy hover:underline">
              hello@foodmo.id
            </a>
            <p className="mt-1 text-black/60">
              Pertanyaan umum, saran, atau pendaftaran listing tempat makan.
            </p>
          </div>
          <div>
            <div className="font-semibold text-black">Koreksi Data</div>
            <a href="mailto:hello@foodmo.id?subject=Koreksi%20Data" className="text-navy hover:underline">
              hello@foodmo.id
            </a>
            <p className="mt-1 text-black/60">
              Subjek: &quot;Koreksi Data&quot;. Lihat{' '}
              <Link href="/koreksi-data" className="text-navy hover:underline">
                kebijakan koreksi
              </Link>{' '}
              untuk detail.
            </p>
          </div>
          <div>
            <div className="font-semibold text-black">Kerja Sama</div>
            <p className="text-black/70">
              Terbuka untuk partnership konten, sponsored listing, dan pemasangan iklan kuliner
              yang relevan. Detail tarif & paket dikirim via email.
            </p>
          </div>
          <div>
            <div className="font-semibold text-black">Privasi & Hukum</div>
            <p className="text-black/70">
              Permintaan terkait data pribadi tunduk pada{' '}
              <Link href="/privacy-policy" className="text-navy hover:underline">
                kebijakan privasi
              </Link>{' '}
              dan{' '}
              <Link href="/terms-of-service" className="text-navy hover:underline">
                syarat &amp; ketentuan
              </Link>
              .
            </p>
          </div>
          <div>
            <div className="font-semibold text-black">Lokasi</div>
            <p className="text-black/70">Indonesia (operasi remote).</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
