/**
 * Procedural description rewriter for listings.
 *
 * Goal: replace templated descriptions ("X adalah ... di kawasan ... Lokasinya
 * cocok untuk pencarian ...") with unique descriptions assembled from each
 * listing's real fields. Designed to produce different sentence structure and
 * factual content per listing — so Google sees varied, listing-specific text.
 *
 * Usage:
 *   DRY RUN:  npx tsx scripts/rewrite-listing-descriptions.ts --dry
 *   APPLY:    npx tsx scripts/rewrite-listing-descriptions.ts --apply
 *   LIMIT:    npx tsx scripts/rewrite-listing-descriptions.ts --dry --limit 10
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RawListing = Awaited<ReturnType<typeof loadListings>>[number];

function parseJsonArray(raw: string | null): string[] {
  if (!raw || raw === '[]') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((s) => String(s).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

const PRICE_PHRASE: Record<string, string> = {
  murah: 'kantong-pelajar — kategori murah meriah',
  sedang: 'standar kafe lokal — kategori sedang',
  mahal: 'mid-up untuk pengalaman kuliner santai — kategori menengah ke atas',
  premium: 'fine dining / premium dengan layanan kelas atas',
};

function pickOne<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// Hash a string into a stable integer so wording is reproducible per slug.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shortAddress(address: string | null | undefined): string {
  if (!address) return '';
  // strip ", Indonesia" / ", DKI Jakarta 12540" etc. — keep first 2 commas worth
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(', ');
  return parts.slice(0, 3).join(', ');
}

function summarizeFacilities(facilities: string[], seed: number): {
  amenities: string[];
  serviceModes: string[];
  vibe: string[];
  payment: string[];
} {
  const amenitiesPool = new Set([
    'WiFi', 'Toilet', 'Mushola', 'Musholla', 'Parkir', 'AC',
    'Tempat duduk', 'Tempat duduk di area terbuka', 'Tempat duduk outdoor',
    'Smoking Area', 'Non Smoking', 'Ramah anak', 'Ramah keluarga',
    'Cocok untuk bekerja menggunakan laptop',
  ]);
  const serviceModesPool = new Set([
    'Makan di tempat', 'Bawa pulang', 'Take Away', 'Delivery', 'Pesan antar',
    'Drive Thru', 'Layanan di tempat', 'Antar tanpa bertemu',
    'Layanan pesan di meja', 'Menerima reservasi', 'Sarapan', 'Brunch',
    'Makan siang', 'Makan malam', 'Cepat saji',
  ]);
  const vibePool = new Set([
    'Nyaman', 'Santai', 'Tenang', 'Trendi', 'Romantis', 'Berkelompok',
    'Mahasiswa', 'Sendiri', 'Cocok untuk bekerja menggunakan laptop',
  ]);
  const paymentPool = new Set([
    'Kartu debit', 'Kartu kredit', 'QRIS', 'Tunai', 'GoPay', 'OVO', 'Dana',
  ]);

  const amenities: string[] = [];
  const serviceModes: string[] = [];
  const vibe: string[] = [];
  const payment: string[] = [];
  for (const f of facilities) {
    if (amenitiesPool.has(f)) amenities.push(f);
    else if (serviceModesPool.has(f)) serviceModes.push(f);
    else if (vibePool.has(f)) vibe.push(f);
    else if (paymentPool.has(f)) payment.push(f);
  }
  const dedup = (arr: string[]) => Array.from(new Set(arr));
  return {
    amenities: dedup(amenities).slice(0, 4),
    serviceModes: dedup(serviceModes).slice(0, 4),
    vibe: dedup(vibe).slice(0, 3),
    payment: dedup(payment).slice(0, 3),
  };
}

function indonesianList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} dan ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, dan ${items.at(-1)}`;
}

function generateDescription(l: RawListing): string {
  const seed = hash(l.slug);
  const facilities = parseJsonArray(l.facilities);
  const fac = summarizeFacilities(facilities, seed);
  const cityName = l.city?.name ?? 'Indonesia';
  const province = l.city?.province?.trim();
  const categoryName = l.category?.name?.trim();
  const addr = shortAddress(l.address);

  const channels: string[] = [];
  if (l.phone) channels.push('telepon');
  if (l.whatsapp) channels.push('WhatsApp');
  if (l.shopeeFoodUrl) channels.push('Shopee Food');
  if (l.tiktokUrl) channels.push('TikTok');
  if (l.instagramUrl) channels.push('Instagram');

  // ---- Paragraph 1: intro, vary the opening sentence per slug
  const openings: ((name: string) => string)[] = [
    (n) =>
      `${n} berada di ${addr || cityName}${
        province ? `, Provinsi ${province}` : ''
      }.`,
    (n) =>
      `Berlokasi di ${addr || cityName}${
        province ? ` (${province})` : ''
      }, ${n} menjadi salah satu pilihan kuliner di area ini.`,
    (n) =>
      `${n} adalah tempat makan yang beroperasi di ${addr || cityName}${
        province ? `, ${province}` : ''
      }.`,
    (n) =>
      `Di kawasan ${addr || cityName}${
        province ? `, ${province}` : ''
      }, terdapat ${n} yang sudah cukup dikenal di kalangan penikmat kuliner setempat.`,
  ];
  const introLine = pickOne(openings, seed)(l.name);

  // Add category info as a separate sentence with variation
  const catLines = categoryName
    ? [
        `Tempat ini terdaftar pada kategori ${categoryName} di FoodMo.`,
        `Berdasarkan jenisnya, ${l.name} masuk dalam kategori ${categoryName}.`,
        `Kategori utama tempat ini adalah ${categoryName}.`,
      ]
    : [];
  const catLine = catLines.length > 0 ? ' ' + pickOne(catLines, seed + 1) : '';

  // ---- Paragraph 2: facilities & service
  const facilitySentences: string[] = [];
  if (fac.serviceModes.length > 0) {
    const list = indonesianList(fac.serviceModes);
    const t = pickOne(
      [
        `Untuk layanan, ${l.name} menyediakan ${list}.`,
        `Pengunjung dapat memilih opsi ${list}.`,
        `Tersedia ${list} untuk memudahkan pelanggan.`,
      ],
      seed + 2,
    );
    facilitySentences.push(t);
  }
  if (fac.amenities.length > 0) {
    const list = indonesianList(fac.amenities);
    const t = pickOne(
      [
        `Fasilitas yang dapat dinikmati di antaranya ${list}.`,
        `Tempat ini dilengkapi ${list}.`,
        `Beberapa fasilitas penunjang yang tersedia: ${list}.`,
      ],
      seed + 3,
    );
    facilitySentences.push(t);
  }
  if (fac.vibe.length > 0) {
    const list = indonesianList(fac.vibe);
    const t = pickOne(
      [
        `Suasananya tergolong ${list}, cocok untuk berbagai keperluan.`,
        `Nuansa tempatnya ${list}.`,
        `${l.name} memiliki suasana ${list} yang dirasakan banyak pengunjung.`,
      ],
      seed + 4,
    );
    facilitySentences.push(t);
  }

  // ---- Paragraph 3: price & rating
  const tailSentences: string[] = [];
  const priceKey = (l.priceRange || '').toLowerCase();
  if (PRICE_PHRASE[priceKey]) {
    tailSentences.push(
      pickOne(
        [
          `Dari sisi harga, ${l.name} berada di kisaran ${PRICE_PHRASE[priceKey]}.`,
          `Kisaran harganya tergolong ${PRICE_PHRASE[priceKey]}.`,
        ],
        seed + 5,
      ),
    );
  }
  if (l.rating != null && Number(l.rating) > 0) {
    const r = Number(l.rating).toFixed(1);
    tailSentences.push(
      pickOne(
        [
          `Rating ringkasan untuk ${l.name} saat ini ${r}/5 berdasarkan data publik yang tersedia.`,
          `Skor rating yang tercatat adalah ${r}/5.`,
        ],
        seed + 6,
      ),
    );
  }
  if (channels.length > 0) {
    tailSentences.push(
      pickOne(
        [
          `Pemilik dapat dihubungi via ${indonesianList(channels)}.`,
          `Saluran kontak yang tersedia mencakup ${indonesianList(channels)}.`,
          `Untuk menghubungi atau memesan, tersedia jalur ${indonesianList(channels)}.`,
        ],
        seed + 7,
      ),
    );
  }

  // Closing CTA — varied
  const ctas = [
    `Cek alamat lengkap, jam buka, dan menu di halaman ini sebelum berkunjung.`,
    `Pastikan ketersediaan menu dan jam operasional pada hari kunjungan langsung kepada pengelola.`,
    `Untuk informasi terbaru terkait jam buka dan menu, silakan konfirmasi langsung ke ${l.name}.`,
  ];
  const cta = pickOne(ctas, seed + 8);

  // Assemble — vary paragraph count based on data richness
  const para1 = `${introLine}${catLine}`;
  const para2 = facilitySentences.join(' ');
  const para3 = [tailSentences.join(' '), cta].filter(Boolean).join(' ');

  return [para1, para2, para3].filter((p) => p && p.trim().length > 0).join('\n\n');
}

async function loadListings(limit?: number) {
  return prisma.listing.findMany({
    where: {
      status: 'published',
      description: {
        contains: 'cocok untuk pencarian',
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      address: true,
      facilities: true,
      priceRange: true,
      rating: true,
      phone: true,
      whatsapp: true,
      instagramUrl: true,
      shopeeFoodUrl: true,
      tiktokUrl: true,
      category: { select: { name: true } },
      city: { select: { name: true, province: true } },
    },
    take: limit,
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const apply = args.includes('--apply');
  const limitIdx = args.indexOf('--limit');
  const limit =
    limitIdx >= 0 && args[limitIdx + 1] ? Number(args[limitIdx + 1]) : undefined;

  if (!dry && !apply) {
    console.error('Specify --dry or --apply');
    process.exit(1);
  }

  const listings = await loadListings(limit);
  console.log(`Found ${listings.length} listings with templated descriptions.`);

  if (dry) {
    for (const l of listings.slice(0, 5)) {
      console.log('\n========');
      console.log(`Slug:  ${l.slug}`);
      console.log(`Name:  ${l.name}`);
      console.log(`---NEW DESCRIPTION---`);
      console.log(generateDescription(l));
    }
    if (listings.length > 5) {
      console.log(`\n...and ${listings.length - 5} more (not printed).`);
    }
    return;
  }

  // apply
  let done = 0;
  for (const l of listings) {
    const newDesc = generateDescription(l);
    await prisma.listing.update({
      where: { id: l.id },
      data: { description: newDesc },
    });
    done++;
    if (done % 100 === 0) console.log(`Updated ${done}/${listings.length}`);
  }
  console.log(`Done. Updated ${done} listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
