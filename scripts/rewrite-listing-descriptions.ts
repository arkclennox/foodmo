/**
 * Procedural description rewriter for listings.
 *
 * Replaces templated/scraped descriptions with varied procedural text
 * assembled from each listing's real, verifiable fields. Tone is kept
 * neutral and factual to align with AdSense content quality guidelines:
 *  - no unverifiable promotional claims ("sudah dikenal", "favorit");
 *  - facilities are classified (via @/lib/facilities) so quality
 *    opinions like "kopi enak" are dropped from the text;
 *  - data sources are acknowledged (data publik, dapat berubah).
 *
 * Usage:
 *   DRY RUN:  npx tsx scripts/rewrite-listing-descriptions.ts --dry [--limit N]
 *   APPLY:    npx tsx scripts/rewrite-listing-descriptions.ts --apply [--all]
 *
 * Without --all, only listings that match templated/scraped patterns are
 * rewritten. With --all, every published listing is regenerated.
 */
import { PrismaClient } from '@prisma/client';
import {
  classifyFacilities,
  type ClassifiedFacilities,
} from '../src/lib/facilities';

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
  murah: 'kategori murah / ramah kantong',
  sedang: 'kategori menengah',
  mahal: 'kategori menengah ke atas',
  premium: 'kategori premium',
};

function pickOne<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shortAddress(address: string | null | undefined): string {
  if (!address) return '';
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 3) return parts.join(', ');
  return parts.slice(0, 3).join(', ');
}

function indonesianList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0].toLowerCase();
  const lc = items.map((i) => i.toLowerCase());
  if (lc.length === 2) return `${lc[0]} dan ${lc[1]}`;
  return `${lc.slice(0, -1).join(', ')}, dan ${lc.at(-1)}`;
}

function generateDescription(l: RawListing): string {
  const seed = hash(l.slug);
  const raw = parseJsonArray(l.facilities);
  const fac: ClassifiedFacilities = classifyFacilities(raw);
  const province = l.city?.province?.trim();
  const categoryName = l.category?.name?.trim();
  const addr = shortAddress(l.address);

  const channels: string[] = [];
  if (l.phone) channels.push('telepon');
  if (l.whatsapp) channels.push('WhatsApp');
  if (l.shopeeFoodUrl) channels.push('Shopee Food');
  if (l.tiktokUrl) channels.push('TikTok');
  if (l.instagramUrl) channels.push('Instagram');
  if (l.googleMapsUrl) channels.push('Google Maps');

  // --- Paragraph 1: factual location & category
  const openings: ((n: string) => string)[] = [
    (n) =>
      `${n} merupakan tempat usaha kuliner yang beralamat di ${addr || l.city?.name || 'Indonesia'}${
        province ? `, ${province}` : ''
      }.`,
    (n) =>
      `Beralamat di ${addr || l.city?.name || 'Indonesia'}${
        province ? ` (${province})` : ''
      }, ${n} merupakan salah satu entri direktori kuliner di area tersebut.`,
    (n) =>
      `${n} berlokasi di ${addr || l.city?.name || 'Indonesia'}${
        province ? `, ${province}` : ''
      } dan terdaftar sebagai tempat kuliner pada direktori ini.`,
    (n) =>
      `Pada area ${addr || l.city?.name || 'Indonesia'}${
        province ? `, ${province}` : ''
      }, terdapat ${n} yang menjadi salah satu entri tempat makan.`,
  ];
  const introLine = pickOne(openings, seed)(l.name);
  const catLine = categoryName
    ? ' ' +
      pickOne(
        [
          `Kategori yang ditetapkan untuk tempat ini adalah ${categoryName}.`,
          `Tempat ini dikategorikan sebagai ${categoryName}.`,
          `Berdasarkan jenis sajiannya, tempat ini masuk ke kategori ${categoryName}.`,
        ],
        seed + 1,
      )
    : '';

  // --- Paragraph 2: facilities, service, atmosphere (only what's verifiable)
  const facSentences: string[] = [];
  if (fac.service.length > 0) {
    const list = indonesianList(fac.service);
    facSentences.push(
      pickOne(
        [
          `Untuk layanan, ${l.name} mencatatkan opsi ${list}.`,
          `Opsi layanan yang tercatat meliputi ${list}.`,
          `Tersedia opsi ${list} bagi pengunjung.`,
        ],
        seed + 2,
      ),
    );
  }
  if (fac.amenities.length > 0) {
    const list = indonesianList(fac.amenities);
    facSentences.push(
      pickOne(
        [
          `Fasilitas yang dicatatkan di antaranya ${list}.`,
          `Tempat ini dilengkapi ${list}.`,
          `Beberapa fasilitas pendukung yang tersedia: ${list}.`,
        ],
        seed + 3,
      ),
    );
  }
  if (fac.diet.length > 0) {
    const list = indonesianList(fac.diet);
    facSentences.push(
      pickOne(
        [
          `Pilihan menu mencakup ${list}.`,
          `Tersedia pilihan ${list} pada menu.`,
        ],
        seed + 4,
      ),
    );
  }
  if (fac.mealTimes.length > 0) {
    const list = indonesianList(fac.mealTimes);
    facSentences.push(
      pickOne(
        [
          `Waktu sajian yang tercatat: ${list}.`,
          `Tempat ini melayani ${list}.`,
        ],
        seed + 5,
      ),
    );
  }
  if (fac.atmosphere.length > 0) {
    const list = indonesianList(fac.atmosphere);
    facSentences.push(
      pickOne(
        [
          `Suasana yang dilaporkan pengunjung: ${list}.`,
          `Catatan suasana tempat: ${list}.`,
        ],
        seed + 6,
      ),
    );
  }
  if (fac.audience.length > 0) {
    const list = indonesianList(fac.audience);
    facSentences.push(
      pickOne(
        [
          `Tempat ini biasa digunakan oleh pengunjung dari kalangan ${list}.`,
          `Cocok untuk pengunjung ${list}.`,
        ],
        seed + 7,
      ),
    );
  }

  // --- Paragraph 3: payment, price, rating with source, channels, CTA
  const tailSentences: string[] = [];
  if (fac.payment.length > 0) {
    const list = indonesianList(fac.payment);
    tailSentences.push(
      pickOne(
        [
          `Metode pembayaran yang tersedia: ${list}.`,
          `Pembayaran dapat dilakukan via ${list}.`,
        ],
        seed + 8,
      ),
    );
  }
  if (fac.accessibility.length > 0) {
    const list = indonesianList(fac.accessibility);
    tailSentences.push(`Catatan aksesibilitas: ${list}.`);
  }
  const priceKey = (l.priceRange || '').toLowerCase();
  if (PRICE_PHRASE[priceKey]) {
    tailSentences.push(
      pickOne(
        [
          `Kisaran harga ditandai pada ${PRICE_PHRASE[priceKey]}.`,
          `Tempat ini berada pada ${PRICE_PHRASE[priceKey]} berdasarkan kategorisasi direktori.`,
        ],
        seed + 9,
      ),
    );
  }
  if (l.rating != null && Number(l.rating) > 0) {
    const r = Number(l.rating).toFixed(1);
    tailSentences.push(
      `Skor rating yang tercatat dari data publik adalah ${r}/5; angka ini hanya rangkuman dan dapat berubah seiring waktu.`,
    );
  }
  if (channels.length > 0) {
    tailSentences.push(
      pickOne(
        [
          `Jalur kontak yang tercatat: ${indonesianList(channels)}.`,
          `Pemilik tercantum dapat dihubungi melalui ${indonesianList(channels)}.`,
        ],
        seed + 10,
      ),
    );
  }
  tailSentences.push(
    pickOne(
      [
        `Sebelum berkunjung, mohon konfirmasi langsung jam operasional, ketersediaan menu, dan harga pada tempat usaha terkait — data dirangkum dari sumber publik dan dapat berubah.`,
        `Informasi pada halaman ini disusun dari sumber publik; pastikan detail terbaru langsung dengan pemilik usaha sebelum berkunjung.`,
        `Detail di halaman ini bersifat informasional dan dapat berubah; konfirmasi langsung dengan pengelola untuk informasi terbaru.`,
      ],
      seed + 11,
    ),
  );

  const para1 = `${introLine}${catLine}`;
  const para2 = facSentences.join(' ');
  const para3 = tailSentences.join(' ');

  return [para1, para2, para3].filter((p) => p && p.trim().length > 0).join('\n\n');
}

async function loadListings(opts: { all: boolean; limit?: number }) {
  return prisma.listing.findMany({
    where: {
      status: 'published',
      ...(opts.all
        ? {}
        : {
            description: {
              contains: 'cocok untuk pencarian',
            },
          }),
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
      googleMapsUrl: true,
      category: { select: { name: true } },
      city: { select: { name: true, province: true } },
    },
    take: opts.limit,
  });
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const apply = args.includes('--apply');
  const all = args.includes('--all');
  const limitIdx = args.indexOf('--limit');
  const limit =
    limitIdx >= 0 && args[limitIdx + 1] ? Number(args[limitIdx + 1]) : undefined;

  if (!dry && !apply) {
    console.error('Specify --dry or --apply (optionally --all and/or --limit N)');
    process.exit(1);
  }

  const listings = await loadListings({ all, limit });
  console.log(
    `Found ${listings.length} listings to rewrite (mode: ${all ? 'all published' : 'only templated'}).`,
  );

  if (dry) {
    for (const l of listings.slice(0, 5)) {
      console.log('\n========');
      console.log(`Slug:  ${l.slug}`);
      console.log(`Name:  ${l.name}`);
      console.log('---NEW DESCRIPTION---');
      console.log(generateDescription(l));
    }
    if (listings.length > 5) {
      console.log(`\n...and ${listings.length - 5} more (not printed).`);
    }
    return;
  }

  let done = 0;
  for (const l of listings) {
    const newDesc = generateDescription(l);
    const newShort =
      newDesc.split('\n\n')[0]?.slice(0, 200).replace(/\s\S*$/, '') ?? null;
    await prisma.listing.update({
      where: { id: l.id },
      data: {
        description: newDesc,
        shortDescription: newShort,
      },
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
