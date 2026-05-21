/**
 * Classifies the raw "facilities" string array (sourced primarily from
 * Google Maps attribute scrape) into meaningful buckets so that:
 *  - the listing UI can render separate, accurate sections instead of a
 *    flat badge soup; and
 *  - the description generator can phrase each bucket properly.
 *
 * Anything that is an unverifiable quality opinion ("Kopi enak"), a
 * contextless single word ("Kopi", "Hidangan penutup"), or a stray noise
 * value ("4", "Biasanya menunggu") is dropped.
 */

export type FacilityCategory =
  | 'amenities'
  | 'service'
  | 'payment'
  | 'mealTimes'
  | 'atmosphere'
  | 'audience'
  | 'diet'
  | 'accessibility';

export type ClassifiedFacilities = Record<FacilityCategory, string[]>;

const RULES: Array<{ category: FacilityCategory; matches: (s: string) => boolean }> = [
  // Accessibility (kept separate so we can highlight inclusivity)
  {
    category: 'accessibility',
    matches: (s) =>
      /kursi roda|aksesibilitas|akses kursi roda/i.test(s) ||
      /toilet netral gender/i.test(s),
  },
  // Amenities (physical facilities)
  {
    category: 'amenities',
    matches: (s) =>
      /wi-?fi|wifi/i.test(s) ||
      /^toilet$/i.test(s) ||
      /parkir/i.test(s) ||
      /\bAC\b/i.test(s) ||
      /tempat duduk/i.test(s) ||
      /kursi tinggi/i.test(s) ||
      /ruang makan pribadi/i.test(s) ||
      /mushola|musholla/i.test(s) ||
      /memiliki bar/i.test(s) ||
      /smoking area|non smoking|area merokok/i.test(s),
  },
  // Service options (how to order/get food)
  {
    category: 'service',
    matches: (s) =>
      /bawa pulang|take ?away/i.test(s) ||
      /^makan di tempat$/i.test(s) ||
      /pesan antar|delivery|antar tanpa bertemu/i.test(s) ||
      /layanan (di tempat|pesan di meja)/i.test(s) ||
      /drive[- ]?through|drive[- ]?thru/i.test(s) ||
      /menerima reservasi|reservasi/i.test(s) ||
      /pesan di konter/i.test(s) ||
      /cepat saji/i.test(s) ||
      /katering/i.test(s),
  },
  // Meal times
  {
    category: 'mealTimes',
    matches: (s) =>
      /^sarapan$/i.test(s) ||
      /^brunch$/i.test(s) ||
      /^makan siang$/i.test(s) ||
      /^makan malam$/i.test(s) ||
      /hidangan larut malam/i.test(s) ||
      /happy hour/i.test(s),
  },
  // Atmosphere
  {
    category: 'atmosphere',
    matches: (s) =>
      /^santai$/i.test(s) ||
      /^nyaman$/i.test(s) ||
      /^tenang$/i.test(s) ||
      /^trendi$/i.test(s) ||
      /^romantis$/i.test(s) ||
      /^olahraga$/i.test(s) ||
      /musik live|pertunjukan live/i.test(s) ||
      /cocok untuk bekerja menggunakan laptop/i.test(s),
  },
  // Audience suitability
  {
    category: 'audience',
    matches: (s) =>
      /makan sendiri/i.test(s) ||
      /berkelompok/i.test(s) ||
      /mahasiswa/i.test(s) ||
      /turis/i.test(s) ||
      /cocok untuk anak[- ]anak/i.test(s) ||
      /ramah (keluarga|anak)/i.test(s) ||
      /menu anak/i.test(s),
  },
  // Diet / food type
  {
    category: 'diet',
    matches: (s) =>
      /halal/i.test(s) ||
      /vegetarian|vegan/i.test(s) ||
      /organik/i.test(s) ||
      /pilihan menu sehat/i.test(s) ||
      /^alkohol$|^bir$|^anggur$|^koktail$|minuman keras/i.test(s),
  },
  // Payment
  {
    category: 'payment',
    matches: (s) =>
      /^hanya tunai$|^tunai$/i.test(s) ||
      /kartu (debit|kredit)/i.test(s) ||
      /pembayaran seluler|nfc/i.test(s) ||
      /qris|gopay|ovo|dana|shopeepay|linkaja/i.test(s),
  },
];

const DROP_PATTERNS: RegExp[] = [
  // unverifiable quality opinions ("kopi enak", "pilihan teh enak", ...)
  /\benak\b/i,
  // generic single-word menu items that aren't facilities
  /^kopi$/i,
  /^hidangan penutup$/i,
  /^makanan siap saji$/i,
  /^biasanya menunggu/i,
  // gender ownership tag (informational but not a facility per se)
  /mengidentifikasi diri sebagai milik perempuan/i,
  // stray numeric / single-char noise
  /^\d+$/,
  /^[a-z]$/i,
  // already redundant with parking detail
  /agak sulit menemukan tempat parkir/i,
];

export function classifyFacilities(raw: string[]): ClassifiedFacilities {
  const out: ClassifiedFacilities = {
    amenities: [],
    service: [],
    payment: [],
    mealTimes: [],
    atmosphere: [],
    audience: [],
    diet: [],
    accessibility: [],
  };
  const seen = new Set<string>();
  for (const facRaw of raw) {
    const f = facRaw.trim();
    if (!f) continue;
    if (seen.has(f.toLowerCase())) continue;
    if (DROP_PATTERNS.some((re) => re.test(f))) continue;
    const rule = RULES.find((r) => r.matches(f));
    if (!rule) continue; // unknown -> drop
    out[rule.category].push(f);
    seen.add(f.toLowerCase());
  }
  return out;
}

export const FACILITY_SECTION_LABELS: Record<FacilityCategory, string> = {
  amenities: 'Fasilitas',
  accessibility: 'Aksesibilitas',
  service: 'Layanan & Pesan',
  payment: 'Metode Pembayaran',
  mealTimes: 'Waktu Sajian',
  atmosphere: 'Suasana',
  audience: 'Cocok Untuk',
  diet: 'Pilihan Menu',
};

export const FACILITY_SECTION_ORDER: FacilityCategory[] = [
  'amenities',
  'service',
  'mealTimes',
  'diet',
  'atmosphere',
  'audience',
  'payment',
  'accessibility',
];
