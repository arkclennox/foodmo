const fs = require('fs');

async function run() {
  console.log("Mengambil data provinsi...");
  const provRes = await fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
  if (!provRes.ok) throw new Error("Gagal mengambil provinsi");
  const provinces = await provRes.json();
  const allCities = [];

  for (const prov of provinces) {
    console.log(`Mengambil data kabupaten/kota untuk ${prov.name}...`);
    const regRes = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${prov.id}.json`);
    if (!regRes.ok) throw new Error(`Gagal mengambil data untuk provinsi ${prov.name}`);
    const regencies = await regRes.json();
    
    for (const reg of regencies) {
      const toTitleCase = str => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      const formattedName = toTitleCase(reg.name);
      const toSlug = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const slug = toSlug(formattedName);
      const provinceName = toTitleCase(prov.name);

      allCities.push({
        slug,
        name: formattedName,
        province: provinceName,
        description: `Jelajahi rekomendasi tempat makan dan kuliner terbaik di ${formattedName}, Provinsi ${provinceName}.`
      });
    }
  }

  const filePath = './prisma/indonesia_cities.json';
  fs.writeFileSync(filePath, JSON.stringify(allCities, null, 2));
  console.log(`\nBerhasil! Tersimpan ${allCities.length} kota/kabupaten di ${filePath}`);
}

run().catch(err => console.error("Error:", err));
