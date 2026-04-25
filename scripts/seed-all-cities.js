const { PrismaClient } = require('@prisma/client');

function slugify(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

const prisma = new PrismaClient();

const citiesData = [
  // Sumatera
  { name: 'Banda Aceh', province: 'Aceh' },
  { name: 'Lhokseumawe', province: 'Aceh' },
  { name: 'Medan', province: 'Sumatera Utara' },
  { name: 'Binjai', province: 'Sumatera Utara' },
  { name: 'Pematangsiantar', province: 'Sumatera Utara' },
  { name: 'Padang', province: 'Sumatera Barat' },
  { name: 'Bukittinggi', province: 'Sumatera Barat' },
  { name: 'Pekanbaru', province: 'Riau' },
  { name: 'Dumai', province: 'Riau' },
  { name: 'Tanjungpinang', province: 'Kepulauan Riau' },
  { name: 'Batam', province: 'Kepulauan Riau' },
  { name: 'Jambi', province: 'Jambi' },
  { name: 'Palembang', province: 'Sumatera Selatan' },
  { name: 'Prabumulih', province: 'Sumatera Selatan' },
  { name: 'Bengkulu', province: 'Bengkulu' },
  { name: 'Bandar Lampung', province: 'Lampung' },
  { name: 'Metro', province: 'Lampung' },
  { name: 'Pangkalpinang', province: 'Kepulauan Bangka Belitung' },
  
  // Jawa
  { name: 'Jakarta', province: 'DKI Jakarta' },
  { name: 'Bogor', province: 'Jawa Barat' },
  { name: 'Depok', province: 'Jawa Barat' },
  { name: 'Bekasi', province: 'Jawa Barat' },
  { name: 'Bandung', province: 'Jawa Barat' },
  { name: 'Cimahi', province: 'Jawa Barat' },
  { name: 'Cirebon', province: 'Jawa Barat' },
  { name: 'Tasikmalaya', province: 'Jawa Barat' },
  { name: 'Sukabumi', province: 'Jawa Barat' },
  { name: 'Serang', province: 'Banten' },
  { name: 'Tangerang', province: 'Banten' },
  { name: 'Tangerang Selatan', province: 'Banten' },
  { name: 'Semarang', province: 'Jawa Tengah' },
  { name: 'Surakarta', province: 'Jawa Tengah' },
  { name: 'Tegal', province: 'Jawa Tengah' },
  { name: 'Pekalongan', province: 'Jawa Tengah' },
  { name: 'Salatiga', province: 'Jawa Tengah' },
  { name: 'Magelang', province: 'Jawa Tengah' },
  { name: 'Yogyakarta', province: 'DI Yogyakarta' },
  { name: 'Surabaya', province: 'Jawa Timur' },
  { name: 'Malang', province: 'Jawa Timur' },
  { name: 'Sidoarjo', province: 'Jawa Timur' },
  { name: 'Kediri', province: 'Jawa Timur' },
  { name: 'Madiun', province: 'Jawa Timur' },
  { name: 'Probolinggo', province: 'Jawa Timur' },
  { name: 'Pasuruan', province: 'Jawa Timur' },
  { name: 'Banyuwangi', province: 'Jawa Timur' },
  { name: 'Jember', province: 'Jawa Timur' },
  { name: 'Gresik', province: 'Jawa Timur' },
  
  // Bali & Nusa Tenggara
  { name: 'Denpasar', province: 'Bali' },
  { name: 'Badung', province: 'Bali' },
  { name: 'Gianyar', province: 'Bali' },
  { name: 'Mataram', province: 'Nusa Tenggara Barat' },
  { name: 'Bima', province: 'Nusa Tenggara Barat' },
  { name: 'Kupang', province: 'Nusa Tenggara Timur' },
  
  // Kalimantan
  { name: 'Pontianak', province: 'Kalimantan Barat' },
  { name: 'Singkawang', province: 'Kalimantan Barat' },
  { name: 'Palangka Raya', province: 'Kalimantan Tengah' },
  { name: 'Banjarmasin', province: 'Kalimantan Selatan' },
  { name: 'Banjarbaru', province: 'Kalimantan Selatan' },
  { name: 'Balikpapan', province: 'Kalimantan Timur' },
  { name: 'Samarinda', province: 'Kalimantan Timur' },
  { name: 'Bontang', province: 'Kalimantan Timur' },
  { name: 'Tarakan', province: 'Kalimantan Utara' },
  
  // Sulawesi
  { name: 'Makassar', province: 'Sulawesi Selatan' },
  { name: 'Parepare', province: 'Sulawesi Selatan' },
  { name: 'Palopo', province: 'Sulawesi Selatan' },
  { name: 'Manado', province: 'Sulawesi Utara' },
  { name: 'Bitung', province: 'Sulawesi Utara' },
  { name: 'Tomohon', province: 'Sulawesi Utara' },
  { name: 'Palu', province: 'Sulawesi Tengah' },
  { name: 'Kendari', province: 'Sulawesi Tenggara' },
  { name: 'Baubau', province: 'Sulawesi Tenggara' },
  { name: 'Gorontalo', province: 'Gorontalo' },
  { name: 'Majene', province: 'Sulawesi Barat' },
  { name: 'Mamuju', province: 'Sulawesi Barat' },
  
  // Maluku & Papua
  { name: 'Ambon', province: 'Maluku' },
  { name: 'Ternate', province: 'Maluku Utara' },
  { name: 'Tidore Kepulauan', province: 'Maluku Utara' },
  { name: 'Jayapura', province: 'Papua' },
  { name: 'Merauke', province: 'Papua Selatan' },
  { name: 'Timika', province: 'Papua Tengah' },
  { name: 'Nabire', province: 'Papua Tengah' },
  { name: 'Sorong', province: 'Papua Barat Daya' },
  { name: 'Manokwari', province: 'Papua Barat' },
];

async function main() {
  console.log('Mulai melakukan seeding daftar kota Indonesia...');
  
  let count = 0;
  for (const city of citiesData) {
    const slug = slugify(city.name);
    try {
      await prisma.city.upsert({
        where: { slug },
        update: {
          name: city.name,
          province: city.province,
        },
        create: {
          slug,
          name: city.name,
          province: city.province,
          description: \`Tempat makan dan kuliner terbaik di \${city.name}, \${city.province}.\`,
        },
      });
      count++;
    } catch (err) {
      console.error(\`Gagal menambahkan kota \${city.name}:\`, err);
    }
  }

  console.log(\`✅ Seeding selesai! Berhasil menambahkan/memperbarui \${count} kota.\`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
