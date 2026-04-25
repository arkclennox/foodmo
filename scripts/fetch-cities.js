const fs = require('fs');
const https = require('https');

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'NodeJS' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Mengambil data provinsi...");
  const provinces = await fetchJson('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
  const allCities = [];

  for (const prov of provinces) {
    console.log(`Mengambil data kabupaten/kota untuk ${prov.name}...`);
    const regencies = await fetchJson(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${prov.id}.json`);
    
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
