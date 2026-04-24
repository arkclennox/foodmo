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
