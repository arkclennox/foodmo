export const PRICE_RANGE_LABEL: Record<string, string> = {
  murah: 'Murah',
  sedang: 'Sedang',
  mahal: 'Mahal',
  premium: 'Premium',
};

export const PRICE_RANGES = ['murah', 'sedang', 'mahal', 'premium'] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export const LISTING_STATUSES = ['draft', 'published', 'archived'] as const;
export const ARTICLE_STATUSES = ['draft', 'published', 'archived'] as const;

export const DEFAULT_PAGE_SIZE = 12;

// Threshold for auto-noindex: pages with content thinner than this
// are marked noindex,follow to keep Google's quality signal high.
export const THIN_CONTENT_THRESHOLDS = {
  listingDescriptionChars: 100,
  cityMinListings: 3,
  categoryMinListings: 3,
};

export const FACILITY_OPTIONS = [
  'WiFi',
  'Parkir',
  'AC',
  'Musholla',
  'Ramah Keluarga',
  'Ramah Anak',
  'Outdoor Seating',
  'Indoor Seating',
  'Drive Thru',
  'Delivery',
  'Take Away',
  'Reservasi',
  'Live Music',
  'Smoking Area',
  'Non Smoking',
  'Halal',
  'Vegetarian Friendly',
];
