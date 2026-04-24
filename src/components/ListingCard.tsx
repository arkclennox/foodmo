import Link from 'next/link';
import { MapPinIcon, StarIcon } from './icons';
import { PRICE_RANGE_LABEL } from '@/lib/constants';

export type ListingCardData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  address: string;
  featuredImageUrl: string | null;
  rating: number;
  priceRange: string | null;
  isFeatured: boolean;
  category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const image =
    listing.featuredImageUrl ||
    'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect fill="%23F8FAFC" width="400" height="300"/><text x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="Arial" font-size="18" fill="%2301083C">Direktori Kuliner</text></svg>',
      );
  const excerpt = listing.shortDescription || listing.description?.slice(0, 120);

  return (
    <article className="card group overflow-hidden transition hover:shadow-md">
      <Link href={`/tempat-makan/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={listing.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {listing.isFeatured && (
            <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-xs font-medium text-white">
              Featured
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {listing.category && (
              <span className="badge">{listing.category.name}</span>
            )}
            {listing.priceRange && (
              <span className="badge-outline">
                {PRICE_RANGE_LABEL[listing.priceRange] ?? listing.priceRange}
              </span>
            )}
          </div>
          <h3 className="mb-1 line-clamp-1 text-base font-semibold text-black transition group-hover:text-navy">
            {listing.name}
          </h3>
          <div className="mb-2 flex items-center gap-1.5 text-xs text-black/60">
            <MapPinIcon className="h-3.5 w-3.5" />
            <span className="line-clamp-1">
              {listing.city?.name ? `${listing.city.name} · ` : ''}
              {listing.address}
            </span>
          </div>
          {excerpt && (
            <p className="line-clamp-2 text-sm text-black/70">{excerpt}</p>
          )}
          {listing.rating > 0 && (
            <div className="mt-3 flex items-center gap-1 text-sm text-navy">
              <StarIcon className="h-4 w-4 fill-current" />
              <span className="font-medium">{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
