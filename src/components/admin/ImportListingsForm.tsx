'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

export function ImportListingsForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setPreview(data.slice(0, 5)); // preview 5 data pertama
      } catch (err: any) {
        setError('Gagal membaca file: ' + err.message);
      }
    };
    reader.readAsBinaryString(selected);
  };

  const processRow = (row: any) => {
    // Fungsi pembantu untuk mengubah string 'N/A' atau kosong menjadi null/undefined
    const clean = (val: any) => {
      if (val === undefined || val === null) return undefined;
      const str = String(val).trim();
      if (str === '' || str.toUpperCase() === 'N/A') return undefined;
      return str;
    };

    const cleanNum = (val: any) => {
      const c = clean(val);
      if (!c) return undefined;
      const num = Number(c);
      return isNaN(num) ? undefined : num;
    };

    const cleanArray = (val: any) => {
      const c = clean(val);
      if (!c) return undefined;
      try {
        // Coba parse JSON jika format array ["A", "B"]
        if (c.startsWith('[') && c.endsWith(']')) {
          return JSON.parse(c);
        }
      } catch {
        // Abaikan jika bukan JSON
      }
      // Deteksi separator (pipe atau koma)
      if (c.includes('|')) {
        return c.split('|').map((s: string) => s.trim()).filter(Boolean);
      }
      return c.split(',').map((s: string) => s.trim()).filter(Boolean);
    };

    return {
      name: clean(row.name),
      slug: clean(row.slug),
      description: clean(row.description),
      shortDescription: clean(row.shortDescription) || clean(row.description)?.substring(0, 150),
      address: clean(row.address),
      phone: clean(row.phone),
      whatsapp: clean(row.whatsapp),
      websiteUrl: clean(row.website_url),
      instagramUrl: clean(row.instagram_url),
      shopeeFoodUrl: clean(row.shopee_food_url),
      tiktokUrl: clean(row.tiktok_url),
      googleMapsUrl: clean(row.google_maps_url),
      priceRange: clean(row.price_range),
      rating: cleanNum(row.rating),
      latitude: cleanNum(row.latitude),
      longitude: cleanNum(row.longitude),
      categoryName: clean(row.category),
      cityName: clean(row.city),
      facilities: cleanArray(row.facilities),
      menuHighlights: cleanArray(row.menu_highlights),
      featuredImageUrl: clean(row.featured_image_url),
      galleryImages: cleanArray(row.gallery_images),
    };
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const bstr = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsBinaryString(file);
      });

      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' });

      // Proses tiap baris
      const processedData = rawData
        .map(processRow)
        .filter((row) => row.name); // Pastikan ada nama

      if (processedData.length === 0) {
        throw new Error("Tidak ada data valid yang ditemukan (kolom 'name' wajib ada).");
      }

      const res = await fetch('/api/admin/listings/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: processedData }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Gagal import data');
      }

      setSuccess(`Berhasil mengimpor ${result.data?.imported || 0} data. ${result.data?.skipped || 0} data dilewati (duplikat).`);
      setFile(null);
      setPreview([]);
      
      // Refresh setelah beberapa detik
      setTimeout(() => {
        router.push('/admin/listings');
        router.refresh();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengimpor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-black/10 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Upload File Excel / CSV</h2>
        <p className="text-sm text-black/60">
          Sistem akan mendeteksi baris dengan nama & kota yang sama, dan mengabaikannya agar tidak terjadi duplikasi data.
          Format kolom yang dibaca: <code>name, slug, description, address, phone, whatsapp, website_url, instagram_url, shopee_food_url, tiktok_url, google_maps_url, price_range, latitude, longitude, category, city, facilities, menu_highlights, featured_image_url, gallery_images</code>.
        </p>

        <div className="mt-4">
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-black/5 file:text-black
              hover:file:bg-black/10"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
            {success}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Preview Data (5 baris pertama)</h3>
            <div className="overflow-x-auto border rounded-lg border-black/10">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/5">
                  <tr>
                    {Object.keys(preview[0]).slice(0, 8).map((key) => (
                      <th key={key} className="px-4 py-2 font-medium">{key}</th>
                    ))}
                    {Object.keys(preview[0]).length > 8 && <th className="px-4 py-2 font-medium">...</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 bg-white">
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).slice(0, 8).map((val: any, j) => (
                        <td key={j} className="px-4 py-2 truncate max-w-[150px]">{String(val)}</td>
                      ))}
                      {Object.values(row).length > 8 && <td className="px-4 py-2">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5"
                onClick={() => { setFile(null); setPreview([]); setError(null); }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Memproses...' : 'Mulai Import'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
