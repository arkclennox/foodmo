import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/Breadcrumb';
import { buildMetadata } from '@/lib/seo';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = buildMetadata({
  title: 'Kontak',
  description: 'Hubungi tim Direktori Kuliner untuk kerja sama, saran, atau pertanyaan.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="section max-w-4xl py-10">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kontak' }]} />
      <h1 className="mb-3 text-3xl font-semibold text-black">Hubungi Kami</h1>
      <p className="mb-8 max-w-2xl text-black/70">
        Punya pertanyaan, ingin mendaftarkan tempat usaha, atau tertarik untuk
        bekerja sama? Silakan isi form berikut atau kirim email langsung.
      </p>
      <div className="grid gap-8 lg:grid-cols-[1fr,320px]">
        <ContactForm />
        <aside className="card space-y-4 p-5 text-sm">
          <div>
            <div className="font-semibold text-black">Email</div>
            <a href="mailto:hello@direktori-kuliner.id" className="text-navy hover:underline">
              hello@direktori-kuliner.id
            </a>
          </div>
          <div>
            <div className="font-semibold text-black">Kerja Sama</div>
            <p className="text-black/70">
              Terbuka untuk partnership konten, sponsored listing, dan pemasangan
              iklan kuliner yang relevan.
            </p>
          </div>
          <div>
            <div className="font-semibold text-black">Sosial Media</div>
            <p className="text-black/70">Segera hadir.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
