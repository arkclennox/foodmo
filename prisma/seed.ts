import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function toJson(arr: unknown): string | null {
  if (!arr) return null;
  if (Array.isArray(arr) && arr.length === 0) return null;
  return JSON.stringify(arr);
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@direktori-kuliner.id').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin1234';
  const adminName = process.env.ADMIN_NAME ?? 'Admin';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: adminName, role: 'admin' },
    create: { email: adminEmail, passwordHash, name: adminName, role: 'admin' },
  });
  console.log(`Seeded admin user: ${adminEmail}`);

  const listingCategories: Array<{
    slug: string;
    name: string;
    description: string;
  }> = [
    {
      slug: 'restoran',
      name: 'Restoran',
      description:
        'Restoran keluarga, fine dining, dan tempat makan dengan menu komplit.',
    },
    {
      slug: 'cafe',
      name: 'Cafe',
      description: 'Cafe untuk ngopi, nongkrong, dan kerja santai dengan WiFi.',
    },
    {
      slug: 'warung-makan',
      name: 'Warung Makan',
      description: 'Warung nasi, warteg, dan makanan rumahan harga merakyat.',
    },
    {
      slug: 'seafood',
      name: 'Seafood',
      description: 'Restoran seafood dengan menu ikan, cumi, udang, dan kepiting.',
    },
    {
      slug: 'bakso',
      name: 'Bakso',
      description: 'Tempat bakso legendaris dan varian bakso unik.',
    },
    {
      slug: 'mie-ayam',
      name: 'Mie Ayam',
      description: 'Warung mie ayam terbaik dengan kuah dan topping bervariasi.',
    },
    {
      slug: 'nasi-goreng',
      name: 'Nasi Goreng',
      description: 'Penjual nasi goreng kaki lima hingga restoran.',
    },
    {
      slug: 'kopi',
      name: 'Kopi',
      description: 'Kedai kopi spesialti dan coffee shop kekinian.',
    },
  ];

  for (const c of listingCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, type: 'listing' },
      create: { ...c, type: 'listing' },
    });
  }

  const articleCategories = [
    { slug: 'tips-kuliner', name: 'Tips Kuliner', description: 'Tips memilih tempat makan.' },
    { slug: 'rekomendasi', name: 'Rekomendasi', description: 'List rekomendasi tempat makan.' },
    { slug: 'resep', name: 'Resep', description: 'Resep masakan Indonesia.' },
  ];
  for (const c of articleCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, type: 'article' },
      create: { ...c, type: 'article' },
    });
  }
  console.log(`Seeded ${listingCategories.length + articleCategories.length} categories`);

  let cities: Array<{ slug: string; name: string; province: string; description: string }> = [];
  try {
    const citiesPath = path.join(process.cwd(), 'prisma', 'indonesia_cities.json');
    const raw = fs.readFileSync(citiesPath, 'utf-8');
    cities = JSON.parse(raw);
    console.log(`Berhasil memuat ${cities.length} kota/kabupaten dari file JSON.`);
  } catch (e) {
    console.log("File prisma/indonesia_cities.json tidak ditemukan. Menggunakan data default...");
    cities = [
    // Sumatera
  { slug: 'banda-aceh', name: 'Banda Aceh', province: 'Aceh', description: 'Kuliner terbaik di Banda Aceh, Aceh.' },
  { slug: 'lhokseumawe', name: 'Lhokseumawe', province: 'Aceh', description: 'Kuliner terbaik di Lhokseumawe, Aceh.' },
  { slug: 'medan', name: 'Medan', province: 'Sumatera Utara', description: 'Kuliner Melayu-Tionghoa: bihun bebek, soto medan, kopi tiam.' },
  { slug: 'binjai', name: 'Binjai', province: 'Sumatera Utara', description: 'Kuliner terbaik di Binjai, Sumatera Utara.' },
  { slug: 'pematangsiantar', name: 'Pematangsiantar', province: 'Sumatera Utara', description: 'Kuliner terbaik di Pematangsiantar, Sumatera Utara.' },
  { slug: 'padang', name: 'Padang', province: 'Sumatera Barat', description: 'Kuliner Padang autentik, rendang, sate padang, dan nasi kapau.' },
  { slug: 'bukittinggi', name: 'Bukittinggi', province: 'Sumatera Barat', description: 'Kuliner terbaik di Bukittinggi, Sumatera Barat.' },
  { slug: 'pekanbaru', name: 'Pekanbaru', province: 'Riau', description: 'Kuliner terbaik di Pekanbaru, Riau.' },
  { slug: 'dumai', name: 'Dumai', province: 'Riau', description: 'Kuliner terbaik di Dumai, Riau.' },
  { slug: 'tanjungpinang', name: 'Tanjungpinang', province: 'Kepulauan Riau', description: 'Kuliner terbaik di Tanjungpinang, Kepulauan Riau.' },
  { slug: 'batam', name: 'Batam', province: 'Kepulauan Riau', description: 'Surga kuliner laut dan aneka makanan di Batam.' },
  { slug: 'jambi', name: 'Jambi', province: 'Jambi', description: 'Kuliner terbaik di Jambi.' },
  { slug: 'palembang', name: 'Palembang', province: 'Sumatera Selatan', description: 'Kota pempek, tekwan, dan kuliner khas musi lainnya.' },
  { slug: 'prabumulih', name: 'Prabumulih', province: 'Sumatera Selatan', description: 'Kuliner terbaik di Prabumulih, Sumatera Selatan.' },
  { slug: 'bengkulu', name: 'Bengkulu', province: 'Bengkulu', description: 'Kuliner terbaik di Bengkulu.' },
  { slug: 'bandar-lampung', name: 'Bandar Lampung', province: 'Lampung', description: 'Kuliner terbaik di Bandar Lampung, Lampung.' },
  { slug: 'metro', name: 'Metro', province: 'Lampung', description: 'Kuliner terbaik di Metro, Lampung.' },
  { slug: 'pangkalpinang', name: 'Pangkalpinang', province: 'Kepulauan Bangka Belitung', description: 'Kuliner terbaik di Pangkalpinang, Kepulauan Bangka Belitung.' },
  
  // Jawa
  { slug: 'jakarta', name: 'Jakarta', province: 'DKI Jakarta', description: 'Ibukota dengan ragam kuliner dari warteg, warung legendaris, hingga fine dining.' },
  { slug: 'bogor', name: 'Bogor', province: 'Jawa Barat', description: 'Kota hujan dengan asinan, soto kuning, dan aneka cafe.' },
  { slug: 'depok', name: 'Depok', province: 'Jawa Barat', description: 'Kuliner mahasiswa, kedai kopi, dan tempat makan keluarga.' },
  { slug: 'bekasi', name: 'Bekasi', province: 'Jawa Barat', description: 'Ragam kuliner nusantara dan modern di Bekasi.' },
  { slug: 'bandung', name: 'Bandung', province: 'Jawa Barat', description: 'Surga kuliner dengan cafe aesthetic, batagor, surabi, dan nasi timbel khas Sunda.' },
  { slug: 'cimahi', name: 'Cimahi', province: 'Jawa Barat', description: 'Kuliner terbaik di Cimahi, Jawa Barat.' },
  { slug: 'cirebon', name: 'Cirebon', province: 'Jawa Barat', description: 'Nasi jamblang, empal gentong, dan kuliner khas pesisir.' },
  { slug: 'tasikmalaya', name: 'Tasikmalaya', province: 'Jawa Barat', description: 'Kuliner terbaik di Tasikmalaya, Jawa Barat.' },
  { slug: 'sukabumi', name: 'Sukabumi', province: 'Jawa Barat', description: 'Kuliner terbaik di Sukabumi, Jawa Barat.' },
  { slug: 'serang', name: 'Serang', province: 'Banten', description: 'Kuliner terbaik di Serang, Banten.' },
  { slug: 'tangerang', name: 'Tangerang', province: 'Banten', description: 'Kawasan kulinari lengkap dari tradisional hingga kekinian.' },
  { slug: 'tangerang-selatan', name: 'Tangerang Selatan', province: 'Banten', description: 'Cafe, resto, dan kuliner modern di Bintaro & BSD.' },
  { slug: 'semarang', name: 'Semarang', province: 'Jawa Tengah', description: 'Kota Lumpia dengan tahu gimbal, lunpia, dan soto.' },
  { slug: 'surakarta', name: 'Surakarta', province: 'Jawa Tengah', description: 'Kota Solo dengan tengkleng, nasi liwet, dan selat solo.' },
  { slug: 'tegal', name: 'Tegal', province: 'Jawa Tengah', description: 'Kuliner sate kambing muda khas Tegal dan tahu aci.' },
  { slug: 'pekalongan', name: 'Pekalongan', province: 'Jawa Tengah', description: 'Kuliner soto tauto dan sego megono.' },
  { slug: 'salatiga', name: 'Salatiga', province: 'Jawa Tengah', description: 'Kuliner terbaik di Salatiga, Jawa Tengah.' },
  { slug: 'magelang', name: 'Magelang', province: 'Jawa Tengah', description: 'Kuliner terbaik di Magelang, Jawa Tengah.' },
  { slug: 'yogyakarta', name: 'Yogyakarta', province: 'DI Yogyakarta', description: 'Kota pelajar dengan gudeg, angkringan, dan kedai kopi legendaris.' },
  { slug: 'surabaya', name: 'Surabaya', province: 'Jawa Timur', description: 'Kota pahlawan dengan rawon, rujak cingur, dan lontong balap.' },
  { slug: 'malang', name: 'Malang', province: 'Jawa Timur', description: 'Kota dingin dengan bakso, cwie mie, dan cafe pegunungan.' },
  { slug: 'sidoarjo', name: 'Sidoarjo', province: 'Jawa Timur', description: 'Kuliner terbaik di Sidoarjo, Jawa Timur.' },
  { slug: 'kediri', name: 'Kediri', province: 'Jawa Timur', description: 'Kuliner terbaik di Kediri, Jawa Timur.' },
  { slug: 'madiun', name: 'Madiun', province: 'Jawa Timur', description: 'Kota pecel dengan berbagai varian sambal kacang yang lezat.' },
  { slug: 'probolinggo', name: 'Probolinggo', province: 'Jawa Timur', description: 'Kuliner terbaik di Probolinggo, Jawa Timur.' },
  { slug: 'pasuruan', name: 'Pasuruan', province: 'Jawa Timur', description: 'Kuliner terbaik di Pasuruan, Jawa Timur.' },
  { slug: 'banyuwangi', name: 'Banyuwangi', province: 'Jawa Timur', description: 'Kuliner sego tempong pedas dan nasi cawuk.' },
  { slug: 'jember', name: 'Jember', province: 'Jawa Timur', description: 'Kuliner terbaik di Jember, Jawa Timur.' },
  { slug: 'gresik', name: 'Gresik', province: 'Jawa Timur', description: 'Kuliner nasi krawu dan pudak khas Gresik.' },
  
  // Bali & Nusa Tenggara
  { slug: 'denpasar', name: 'Denpasar', province: 'Bali', description: 'Kuliner babi guling, nasi campur, dan masakan Bali autentik.' },
  { slug: 'badung', name: 'Badung', province: 'Bali', description: 'Kawasan Kuta & Seminyak dengan beach club dan restoran fine dining.' },
  { slug: 'gianyar', name: 'Gianyar', province: 'Bali', description: 'Kawasan Ubud dengan restoran organik, vegan, dan babi guling.' },
  { slug: 'mataram', name: 'Mataram', province: 'Nusa Tenggara Barat', description: 'Kuliner ayam taliwang dan sate bulayak.' },
  { slug: 'bima', name: 'Bima', province: 'Nusa Tenggara Barat', description: 'Kuliner terbaik di Bima, Nusa Tenggara Barat.' },
  { slug: 'kupang', name: 'Kupang', province: 'Nusa Tenggara Timur', description: 'Kuliner sei sapi dan ikan bakar khas Timor.' },
  
  // Kalimantan
  { slug: 'pontianak', name: 'Pontianak', province: 'Kalimantan Barat', description: 'Kuliner pisang goreng srikaya, kopi tiam, dan choi pan.' },
  { slug: 'singkawang', name: 'Singkawang', province: 'Kalimantan Barat', description: 'Kuliner pecinan khas Singkawang.' },
  { slug: 'palangka-raya', name: 'Palangka Raya', province: 'Kalimantan Tengah', description: 'Kuliner terbaik di Palangka Raya, Kalimantan Tengah.' },
  { slug: 'banjarmasin', name: 'Banjarmasin', province: 'Kalimantan Selatan', description: 'Soto banjar dan aneka masakan sungai.' },
  { slug: 'banjarbaru', name: 'Banjarbaru', province: 'Kalimantan Selatan', description: 'Kuliner terbaik di Banjarbaru, Kalimantan Selatan.' },
  { slug: 'balikpapan', name: 'Balikpapan', province: 'Kalimantan Timur', description: 'Kuliner seafood, kepiting, dan aneka cafe modern.' },
  { slug: 'samarinda', name: 'Samarinda', province: 'Kalimantan Timur', description: 'Nasi kuning dan amplang khas Samarinda.' },
  { slug: 'bontang', name: 'Bontang', province: 'Kalimantan Timur', description: 'Kuliner terbaik di Bontang, Kalimantan Timur.' },
  { slug: 'tarakan', name: 'Tarakan', province: 'Kalimantan Utara', description: 'Kuliner kepiting soka dan aneka hidangan laut.' },
  
  // Sulawesi
  { slug: 'makassar', name: 'Makassar', province: 'Sulawesi Selatan', description: 'Coto makassar, pisang epe, pallubasa, dan konro.' },
  { slug: 'parepare', name: 'Parepare', province: 'Sulawesi Selatan', description: 'Kuliner terbaik di Parepare, Sulawesi Selatan.' },
  { slug: 'palopo', name: 'Palopo', province: 'Sulawesi Selatan', description: 'Kapurung dan ikan bakar khas Luwu.' },
  { slug: 'manado', name: 'Manado', province: 'Sulawesi Utara', description: 'Kuliner pedas, tinutuan, dan hidangan laut segar.' },
  { slug: 'bitung', name: 'Bitung', province: 'Sulawesi Utara', description: 'Kuliner terbaik di Bitung, Sulawesi Utara.' },
  { slug: 'tomohon', name: 'Tomohon', province: 'Sulawesi Utara', description: 'Kuliner ekstrem dan tradisional Minahasa.' },
  { slug: 'palu', name: 'Palu', province: 'Sulawesi Tengah', description: 'Kaledo khas Palu.' },
  { slug: 'kendari', name: 'Kendari', province: 'Sulawesi Tenggara', description: 'Kuliner sinonggi dan seafood khas Kendari.' },
  { slug: 'baubau', name: 'Baubau', province: 'Sulawesi Tenggara', description: 'Kuliner terbaik di Baubau, Sulawesi Tenggara.' },
  { slug: 'gorontalo', name: 'Gorontalo', province: 'Gorontalo', description: 'Binte biluhuta dan aneka olahan jagung.' },
  { slug: 'majene', name: 'Majene', province: 'Sulawesi Barat', description: 'Kuliner terbaik di Majene, Sulawesi Barat.' },
  { slug: 'mamuju', name: 'Mamuju', province: 'Sulawesi Barat', description: 'Kuliner terbaik di Mamuju, Sulawesi Barat.' },
  
  // Maluku & Papua
  { slug: 'ambon', name: 'Ambon', province: 'Maluku', description: 'Papeda, ikan kuah kuning, dan kopi Ambon.' },
  { slug: 'ternate', name: 'Ternate', province: 'Maluku Utara', description: 'Kuliner rempah khas Ternate.' },
  { slug: 'tidore-kepulauan', name: 'Tidore Kepulauan', province: 'Maluku Utara', description: 'Kuliner terbaik di Tidore.' },
  { slug: 'jayapura', name: 'Jayapura', province: 'Papua', description: 'Papeda dan ikan bakar colo-colo khas Papua.' },
  { slug: 'merauke', name: 'Merauke', province: 'Papua Selatan', description: 'Sate rusa dan aneka kuliner Merauke.' },
  { slug: 'timika', name: 'Timika', province: 'Papua Tengah', description: 'Kuliner terbaik di Timika, Papua Tengah.' },
  { slug: 'nabire', name: 'Nabire', province: 'Papua Tengah', description: 'Kuliner terbaik di Nabire.' },
  { slug: 'sorong', name: 'Sorong', province: 'Papua Barat Daya', description: 'Kuliner laut segar khas Sorong.' },
  { slug: 'manokwari', name: 'Manokwari', province: 'Papua Barat', description: 'Kuliner khas Papua Barat.' },
  ];

  for (const c of cities) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: { name: c.name, province: c.province, description: c.description },
      create: c,
    });
  }
  console.log(`Seeded ${cities.length} cities`);

  const sampleListings = [
    {
      slug: 'bakso-langganan-pak-budi',
      name: 'Bakso Langganan Pak Budi',
      categorySlug: 'bakso',
      citySlug: 'malang',
      shortDescription: 'Bakso urat legendaris dengan kuah gurih khas Malang.',
      description:
        'Bakso Pak Budi sudah berjualan sejak 1985 di Malang. Andalannya adalah bakso urat jumbo, bakso halus, dan tetelan yang dimasak di kuah kaldu sapi gurih selama lebih dari 8 jam.\n\nCocok untuk makan siang keluarga, dengan harga bersahabat dan porsi yang mengenyangkan.',
      address: 'Jl. Ijen No. 25, Malang',
      phone: '081234567890',
      whatsapp: '6281234567890',
      priceRange: 'murah',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      galleryImages: [
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
        'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=800',
      ],
      openingHours: {
        mon: '09:00-21:00',
        tue: '09:00-21:00',
        wed: '09:00-21:00',
        thu: '09:00-21:00',
        fri: '09:00-21:00',
        sat: '09:00-22:00',
        sun: '09:00-22:00',
      },
      facilities: ['Parkir', 'Ramah Keluarga', 'Take Away', 'Halal'],
      menuHighlights: ['Bakso Urat Jumbo', 'Bakso Tetelan', 'Mie Ayam Spesial'],
      rating: 4.7,
      isFeatured: true,
    },
    {
      slug: 'kopi-senja-bandung',
      name: 'Kopi Senja Bandung',
      categorySlug: 'cafe',
      citySlug: 'bandung',
      shortDescription: 'Cafe aesthetic dengan pemandangan senja & kopi spesialti.',
      description:
        'Kopi Senja berada di daerah Dago dengan pemandangan lembah Bandung. Menu andalan: V60, Es Kopi Susu Aren, dan croissant artisan. Tempat favorit untuk kerja remote dan meeting kasual.',
      address: 'Jl. Dago Giri No. 12, Bandung',
      websiteUrl: 'https://example.com',
      instagramUrl: 'https://instagram.com/kopisenja',
      priceRange: 'sedang',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
      openingHours: {
        mon: '08:00-22:00',
        tue: '08:00-22:00',
        wed: '08:00-22:00',
        thu: '08:00-22:00',
        fri: '08:00-23:00',
        sat: '08:00-23:00',
        sun: '08:00-22:00',
      },
      facilities: ['WiFi', 'AC', 'Outdoor Seating', 'Indoor Seating', 'Parkir', 'Halal'],
      menuHighlights: ['V60 Gayo', 'Es Kopi Susu Aren', 'Croissant Cokelat'],
      rating: 4.6,
      isFeatured: true,
    },
    {
      slug: 'warteg-ibu-siti',
      name: 'Warteg Ibu Siti',
      categorySlug: 'warung-makan',
      citySlug: 'jakarta',
      shortDescription: 'Warteg 24 jam dengan menu rumahan khas Tegal.',
      description:
        'Warteg Ibu Siti buka 24 jam di kawasan Tebet. Menu favorit: sayur lodeh, semur jengkol, ikan mas goreng, dan tempe orek. Harga bersahabat dan porsi besar.',
      address: 'Jl. Tebet Raya No. 45, Jakarta Selatan',
      phone: '0211234567',
      priceRange: 'murah',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
      openingHours: {
        mon: '00:00-23:59',
        tue: '00:00-23:59',
        wed: '00:00-23:59',
        thu: '00:00-23:59',
        fri: '00:00-23:59',
        sat: '00:00-23:59',
        sun: '00:00-23:59',
      },
      facilities: ['Take Away', 'Halal'],
      menuHighlights: ['Ikan Mas Goreng', 'Semur Jengkol', 'Tempe Orek'],
      rating: 4.4,
      isFeatured: false,
    },
    {
      slug: 'nasi-goreng-pak-kumis',
      name: 'Nasi Goreng Pak Kumis',
      categorySlug: 'nasi-goreng',
      citySlug: 'jakarta',
      shortDescription: 'Nasi goreng kampung legendaris dengan arang.',
      description:
        'Nasi goreng dimasak langsung di atas bara arang, memberikan aroma smoky khas. Tersedia nasi goreng kampung, spesial seafood, dan gila.',
      address: 'Jl. Sabang No. 15, Jakarta Pusat',
      priceRange: 'murah',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
      openingHours: { mon: '18:00-02:00', sun: 'Tutup' },
      facilities: ['Take Away', 'Outdoor Seating', 'Halal'],
      menuHighlights: ['Nasi Goreng Kampung', 'Nasi Goreng Gila', 'Mie Goreng'],
      rating: 4.8,
      isFeatured: true,
    },
    {
      slug: 'seafood-bahari-bali',
      name: 'Seafood Bahari Bali',
      categorySlug: 'seafood',
      citySlug: 'bali',
      shortDescription: 'Restoran seafood tepi pantai Jimbaran dengan ikan bakar segar.',
      description:
        'Restoran seafood di Jimbaran dengan pilihan ikan, cumi, kepiting, dan lobster segar yang dibakar di atas sabut kelapa. Pemandangan sunset yang memukau.',
      address: 'Pantai Jimbaran, Bali',
      priceRange: 'mahal',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1559847844-1ff7c85cdb6c?w=800',
      openingHours: {
        mon: '11:00-23:00',
        tue: '11:00-23:00',
        wed: '11:00-23:00',
        thu: '11:00-23:00',
        fri: '11:00-23:30',
        sat: '11:00-23:30',
        sun: '11:00-23:00',
      },
      facilities: ['AC', 'Parkir', 'Ramah Keluarga', 'Reservasi', 'Outdoor Seating'],
      menuHighlights: ['Ikan Kakap Bakar', 'Lobster Saus Padang', 'Cumi Goreng Tepung'],
      rating: 4.5,
      isFeatured: true,
    },
    {
      slug: 'gudeg-yu-djum',
      name: 'Gudeg Yu Djum Legendaris',
      categorySlug: 'warung-makan',
      citySlug: 'yogyakarta',
      shortDescription: 'Gudeg kering khas Yogyakarta yang legendaris sejak 1950.',
      description:
        'Gudeg Yu Djum menyajikan gudeg kering dengan kuah areh kental, ayam kampung, telur, dan krecek. Cocok untuk oleh-oleh karena tahan lama.',
      address: 'Jl. Wijilan No. 167, Yogyakarta',
      priceRange: 'sedang',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1585511543320-9f9c4b3e5a9a?w=800',
      openingHours: { mon: '06:00-22:00' },
      facilities: ['Take Away', 'Halal', 'Ramah Keluarga'],
      menuHighlights: ['Gudeg Komplit', 'Krecek Pedas', 'Ayam Kampung'],
      rating: 4.6,
      isFeatured: false,
    },
    {
      slug: 'rawon-setan-embong-malang',
      name: 'Rawon Setan Embong Malang',
      categorySlug: 'restoran',
      citySlug: 'surabaya',
      shortDescription: 'Rawon legendaris Surabaya buka 24 jam.',
      description:
        'Rawon Setan dinamai karena dulu buka hingga larut malam. Kuah kluweknya pekat, daging empuk, disajikan dengan tauge pendek dan sambal.',
      address: 'Jl. Embong Malang, Surabaya',
      priceRange: 'sedang',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800',
      openingHours: { mon: '00:00-23:59' },
      facilities: ['Halal', 'Take Away', 'Parkir'],
      menuHighlights: ['Rawon Daging Empuk', 'Empal Goreng', 'Sate Komoh'],
      rating: 4.7,
      isFeatured: true,
    },
    {
      slug: 'mie-ayam-tumini',
      name: 'Mie Ayam Tumini',
      categorySlug: 'mie-ayam',
      citySlug: 'yogyakarta',
      shortDescription: 'Mie ayam legendaris Yogya dengan kuah gurih.',
      description:
        'Mie Ayam Tumini ramai sejak sore hingga malam. Mie kenyal, ayam manis-gurih, dan pangsit renyah.',
      address: 'Jl. Imogiri Timur KM 7, Yogyakarta',
      priceRange: 'murah',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
      openingHours: { mon: '16:00-23:00' },
      facilities: ['Halal', 'Take Away'],
      menuHighlights: ['Mie Ayam Komplit', 'Pangsit Goreng', 'Es Teh'],
      rating: 4.5,
      isFeatured: false,
    },
  ];

  const categoryMap = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );
  const cityMap = new Map((await prisma.city.findMany()).map((c) => [c.slug, c.id]));

  for (const l of sampleListings) {
    await prisma.listing.upsert({
      where: { slug: l.slug },
      update: {
        name: l.name,
        description: l.description,
        shortDescription: l.shortDescription,
        categoryId: categoryMap.get(l.categorySlug) ?? null,
        cityId: cityMap.get(l.citySlug) ?? null,
        address: l.address,
        phone: 'phone' in l ? (l as Record<string, string>).phone ?? null : null,
        whatsapp: 'whatsapp' in l ? (l as Record<string, string>).whatsapp ?? null : null,
        websiteUrl: 'websiteUrl' in l ? (l as Record<string, string>).websiteUrl ?? null : null,
        instagramUrl: 'instagramUrl' in l ? (l as Record<string, string>).instagramUrl ?? null : null,
        priceRange: l.priceRange,
        openingHours: JSON.stringify(l.openingHours),
        facilities: toJson(l.facilities),
        menuHighlights: toJson(l.menuHighlights),
        featuredImageUrl: l.featuredImageUrl,
        galleryImages: 'galleryImages' in l ? toJson((l as Record<string, unknown>).galleryImages) : null,
        rating: l.rating,
        status: 'published',
        isFeatured: l.isFeatured,
      },
      create: {
        slug: l.slug,
        name: l.name,
        description: l.description,
        shortDescription: l.shortDescription,
        categoryId: categoryMap.get(l.categorySlug) ?? null,
        cityId: cityMap.get(l.citySlug) ?? null,
        address: l.address,
        phone: 'phone' in l ? (l as Record<string, string>).phone ?? null : null,
        whatsapp: 'whatsapp' in l ? (l as Record<string, string>).whatsapp ?? null : null,
        websiteUrl: 'websiteUrl' in l ? (l as Record<string, string>).websiteUrl ?? null : null,
        instagramUrl: 'instagramUrl' in l ? (l as Record<string, string>).instagramUrl ?? null : null,
        priceRange: l.priceRange,
        openingHours: JSON.stringify(l.openingHours),
        facilities: toJson(l.facilities),
        menuHighlights: toJson(l.menuHighlights),
        featuredImageUrl: l.featuredImageUrl,
        galleryImages: 'galleryImages' in l ? toJson((l as Record<string, unknown>).galleryImages) : null,
        rating: l.rating,
        status: 'published',
        isFeatured: l.isFeatured,
      },
    });
  }
  console.log(`Seeded ${sampleListings.length} listings`);

  const sampleArticles = [
    {
      slug: 'rekomendasi-cafe-kerja-bandung',
      title: '7 Cafe Paling Nyaman untuk Kerja di Bandung',
      excerpt:
        'Butuh tempat kerja remote yang kondusif di Bandung? Inilah daftar cafe dengan WiFi kencang dan suasana tenang.',
      contentHtml: `
<p>Bekerja dari cafe sedang jadi tren di Bandung. Selain kopinya enak, banyak cafe yang menyediakan WiFi cepat dan suasana yang mendukung produktivitas. Berikut rekomendasi kami.</p>
<h2>1. Kopi Senja Bandung</h2>
<p>Cafe aesthetic di Dago dengan pemandangan lembah Bandung. WiFi kencang, colokan banyak, dan menu kopi spesialti.</p>
<h2>2. Tempat lain</h2>
<p>Banyak cafe lain yang juga cocok untuk kerja. Eksplorasi sendiri di halaman direktori cafe kami.</p>
`,
      categorySlug: 'rekomendasi',
      tags: ['bandung', 'cafe', 'wfh'],
      relatedListingSlugs: ['kopi-senja-bandung'],
      authorName: 'Tim Direktori Kuliner',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
    },
    {
      slug: 'panduan-warteg-jakarta',
      title: 'Panduan Memilih Warteg Terbaik di Jakarta',
      excerpt:
        'Tips memilih warteg yang bersih, enak, dan ramah kantong di kota besar seperti Jakarta.',
      contentHtml: `
<p>Warteg (Warung Tegal) adalah penyelamat bagi pekerja harian di Jakarta. Dengan harga terjangkau dan menu rumahan, warteg jadi pilihan favorit. Berikut cara memilih warteg terbaik.</p>
<h2>1. Perhatikan kebersihan</h2>
<p>Pilih warteg dengan dapur dan etalase yang terlihat bersih. Menu ditutup kaca, piring dicuci bersih.</p>
<h2>2. Perhatikan ramai tidaknya pelanggan</h2>
<p>Warteg ramai biasanya tanda makanan enak dan rotasi bahan baku cepat sehingga lebih segar.</p>
<h2>3. Cek harga</h2>
<p>Harga wajar warteg di Jakarta: Rp 15.000 - 25.000 per porsi tergantung lauk.</p>
`,
      categorySlug: 'tips-kuliner',
      tags: ['jakarta', 'warteg', 'tips'],
      relatedListingSlugs: ['warteg-ibu-siti'],
      authorName: 'Tim Direktori Kuliner',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    },
    {
      slug: 'kuliner-malam-legendaris-surabaya',
      title: '5 Kuliner Malam Legendaris di Surabaya',
      excerpt:
        'Dari rawon setan hingga sate klopo, jelajahi kuliner malam Surabaya yang wajib dicoba.',
      contentHtml: `
<p>Surabaya adalah surga kuliner malam. Berbagai tempat makan legendaris buka hingga larut, cocok untuk kamu yang lapar tengah malam.</p>
<h2>1. Rawon Setan</h2>
<p>Nama "setan" berasal dari jam buka yang dulu hingga dinihari. Kuah kluwek pekat dan daging empuk.</p>
<h2>2. Lontong Balap</h2>
<p>Kuliner khas Surabaya dengan lontong, tauge, tahu goreng, lentho, kuah petis.</p>
`,
      categorySlug: 'rekomendasi',
      tags: ['surabaya', 'kuliner-malam', 'rawon'],
      relatedListingSlugs: ['rawon-setan-embong-malang'],
      authorName: 'Tim Direktori Kuliner',
      featuredImageUrl:
        'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    },
  ];

  const listingMap = new Map(
    (await prisma.listing.findMany()).map((l) => [l.slug, l.id]),
  );

  for (const a of sampleArticles) {
    const relatedIds = a.relatedListingSlugs
      .map((s) => listingMap.get(s))
      .filter((v): v is string => Boolean(v));
    await prisma.article.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        contentHtml: a.contentHtml.trim(),
        categoryId: categoryMap.get(a.categorySlug) ?? null,
        tags: toJson(a.tags),
        relatedListingIds: toJson(relatedIds),
        authorName: a.authorName,
        featuredImageUrl: a.featuredImageUrl,
        status: 'published',
        publishedAt: new Date(),
      },
      create: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        contentHtml: a.contentHtml.trim(),
        categoryId: categoryMap.get(a.categorySlug) ?? null,
        tags: toJson(a.tags),
        relatedListingIds: toJson(relatedIds),
        authorName: a.authorName,
        featuredImageUrl: a.featuredImageUrl,
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded ${sampleArticles.length} articles`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
