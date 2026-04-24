import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ListingCard } from '@/components/ListingCard';
import {
  ClockIcon,
  GlobeIcon,
  GoogleMapsIcon,
  InstagramIcon,
  MapPinIcon,
  PhoneIcon,
  ShopeeFoodIcon,
  StarIcon,
  TiktokIcon,
  WhatsappIcon,
} from '@/components/icons';
import { findListingBySlug, listListings } from '@/lib/queries';
import { parseJsonObject } from '@/lib/json-fields';
import { PRICE_RANGE_LABEL } from '@/lib/constants';
import { buildMetadata, siteUrl } from '@/lib/seo';
import { prisma } from '@/lib/db';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await findListingBySlug(slug);
  if (!listing) return buildMetadata({ title: 'Tempat makan tidak ditemukan' });
  return buildMetadata({
    title: listing.metaTitle || `${listing.name}${listing.city ? ` — ${listing.city.name}` : ''}`,
    description:
      listing.metaDescription ||
      listing.shortDescription ||
      listing.description.slice(0, 160),
    path: `/tempat-makan/${listing.slug}`,
    image: listing.featuredImageUrl || undefined,
    type: 'website',
  });
}

const DAY_LABELS: Record<string, string> = {
  mon: 'Senin',
  tue: 'Selasa',
  wed: 'Rabu',
  thu: 'Kamis',
  fri: 'Jumat',
  sat: 'Sabtu',
  sun: 'Minggu',
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await findListingBySlug(slug);
  if (!listing) notFound();

  const openingHours = parseJsonObject<Record<string, string>>(listing.openingHours);
  const related = await listListings({
    categorySlug: listing.category?.slug,
    citySlug: listing.city?.slug,
    limit: 4,
  });
  const relatedItems = related.items.filter((i) => i.id !== listing.id).slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: listing.name,
    description: listing.description,
    image: listing.featuredImageUrl || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city?.name,
      addressCountry: 'ID',
    },
    telephone: listing.phone || undefined,
    url: siteUrl(`/tempat-makan/${listing.slug}`),
    servesCuisine: listing.category?.name,
    priceRange: listing.priceRange || undefined,
    aggregateRating:
      listing.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: listing.rating,
            ratingCount: 1,
          }
        : undefined,
  };

  return (
    <div className="section py-8">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Direktori', href: '/tempat-makan' },
          { label: listing.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div>
          <div className="card overflow-hidden">
            {listing.featuredImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.featuredImageUrl}
                alt={listing.name}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center bg-soft text-navy">
                <span className="text-lg font-medium">{listing.name}</span>
              </div>
            )}
          </div>
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {listing.category && (
                <Link
                  href={`/kategori/${listing.category.slug}`}
                  className="badge"
                >
                  {listing.category.name}
                </Link>
              )}
              {listing.city && (
                <Link href={`/kota/${listing.city.slug}`} className="badge-outline">
                  {listing.city.name}
                </Link>
              )}
              {listing.priceRange && (
                <span className="badge-outline">
                  Harga: {PRICE_RANGE_LABEL[listing.priceRange] ?? listing.priceRange}
                </span>
              )}
              {listing.rating > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-xs font-medium text-white">
                  <StarIcon className="h-3.5 w-3.5 fill-current" />
                  {listing.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-semibold text-black sm:text-4xl">
              {listing.name}
            </h1>
            <div className="mt-2 flex items-start gap-2 text-black/70">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{listing.address}</p>
            </div>
            <article className="prose prose-navy mt-6 max-w-none text-black/80">
              {listing.description.split(/\n\n+/).map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </article>

            {listing.menuHighlightsList.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-semibold text-black">Menu unggulan</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {listing.menuHighlightsList.map((item) => (
                    <li
                      key={item}
                      className="card flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {listing.facilitiesList.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-semibold text-black">Fasilitas</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.facilitiesList.map((item) => (
                    <span key={item} className="badge-outline">
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {listing.galleryImagesList.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-semibold text-black">Galeri</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {listing.galleryImagesList.map((src, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${src}-${idx}`}
                      src={src}
                      alt={`${listing.name} - foto ${idx + 1}`}
                      className="aspect-square w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-4 text-lg font-semibold text-black">Kontak & Info</h2>
            <div className="flex flex-col gap-2">
              {listing.phone && (
                <a
                  href={`tel:${listing.phone}`}
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <PhoneIcon className="h-4 w-4 text-navy shrink-0" />
                  <span>{listing.phone}</span>
                </a>
              )}
              {listing.whatsapp && (
                <a
                  href={`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <WhatsappIcon className="h-4 w-4 text-navy shrink-0" />
                  <span>WhatsApp: {listing.whatsapp}</span>
                </a>
              )}
              {listing.websiteUrl && (
                <a
                  href={listing.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <GlobeIcon className="h-4 w-4 text-navy shrink-0" />
                  <span className="truncate">Kunjungi Website</span>
                </a>
              )}
              {listing.instagramUrl && (
                <a
                  href={listing.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <InstagramIcon className="h-4 w-4 text-navy shrink-0" />
                  <span className="truncate">Lihat Instagram</span>
                </a>
              )}
              {listing.shopeeFoodUrl && (
                <a
                  href={listing.shopeeFoodUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <ShopeeFoodIcon className="h-4 w-4 text-navy shrink-0" />
                  <span className="truncate">Pesan di Shopee Food</span>
                </a>
              )}
              {listing.tiktokUrl && (
                <a
                  href={listing.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <TiktokIcon className="h-4 w-4 text-navy shrink-0" />
                  <span className="truncate">Lihat TikTok</span>
                </a>
              )}
              {listing.googleMapsUrl && (
                <a
                  href={listing.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary flex items-center gap-2 justify-start"
                >
                  <GoogleMapsIcon className="h-4 w-4 text-navy shrink-0" />
                  <span className="truncate">Buka di Google Maps</span>
                </a>
              )}
              {!listing.phone && !listing.whatsapp && !listing.websiteUrl && !listing.instagramUrl && !listing.shopeeFoodUrl && !listing.tiktokUrl && !listing.googleMapsUrl && (
                <p className="text-sm text-black/60">
                  Belum ada kontak yang diisi pemilik.
                </p>
              )}
            </div>
          </div>

          {openingHours && Object.keys(openingHours).length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-black">
                <ClockIcon className="h-5 w-5 text-navy" /> Jam buka
              </h2>
              <ul className="space-y-1.5 text-sm">
                {Object.entries(openingHours).map(([day, hours]) => (
                  <li key={day} className="flex justify-between gap-3">
                    <span className="text-black/80">{DAY_LABELS[day] ?? day}</span>
                    <span className="text-black/60">{hours}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(listing.latitude != null && listing.longitude != null) && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 p-4 pb-0">
                <GoogleMapsIcon className="h-5 w-5 text-navy" />
                <h2 className="text-lg font-semibold text-black">Lokasi</h2>
              </div>
              <div className="p-3">
                <iframe
                  title={`Lokasi ${listing.name}`}
                  className="h-52 w-full rounded-lg border-0"
                  src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=16&output=embed`}
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          )}

        </aside>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-black">Tempat serupa lainnya</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <RelatedArticles listingId={listing.id} />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}

async function RelatedArticles({ listingId }: { listingId: string }) {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      relatedListingIds: { contains: `"${listingId}"` },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: 3,
  });
  if (articles.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold text-black">Artikel terkait</h2>
      <ul className="space-y-2">
        {articles.map((a) => (
          <li key={a.id}>
            <Link
              href={`/blog/${a.slug}`}
              className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition hover:border-navy"
            >
              <span className="font-medium text-black">{a.title}</span>
              <span className="text-sm text-navy">Baca →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
