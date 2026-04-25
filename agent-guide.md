# Foodmo API — Panduan Integrasi untuk Agent / Automasi

Dokumen ini menjelaskan cara menggunakan API Foodmo untuk membuat dan memperbarui konten (artikel & listing) secara otomatis, misalnya dari agen AI, CMS eksternal, atau skrip automasi.

---

## 1. Cara Mendapatkan API Key

1. Login ke dashboard admin di `/admin`
2. Buka menu **API Keys**
3. Klik **Buat API key baru**
4. Isi nama/keperluan (contoh: `Agen AI - AutoPosting`)
5. Centang permissions yang dibutuhkan
6. Klik **Buat API key** → **salin key yang muncul sekarang** (tidak akan ditampilkan lagi)

Format API key: `dk_<64 karakter hex>`

---

## 2. Autentikasi

Sertakan API key di setiap request sebagai HTTP header:

```
x-api-key: dk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Rate limit**: 60 request per menit per key. Jika melampaui, server mengembalikan `403 Forbidden`.

---

## 3. Permissions

| Permission | Deskripsi |
|------------|-----------|
| `articles:create` | Membuat artikel baru |
| `articles:update` | Memperbarui artikel yang ada |
| `articles:read` | Membaca artikel (untuk penggunaan mendatang) |
| `listings:create` | Membuat listing baru |
| `listings:update` | Memperbarui listing yang ada |
| `listings:read` | Membaca listing (untuk penggunaan mendatang) |

---

## 4. Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000` |
| Production | `https://foodmo.id` |

---

## 5. Endpoint Artikel

### 5.1 Buat Artikel Baru

**`POST /api/external/articles`**

Membutuhkan permission: `articles:create`

**Headers:**
```
Content-Type: application/json
x-api-key: dk_...
```

**Body (minimal):**
```json
{
  "title": "10 Warung Makan Terenak di Yogyakarta",
  "content_html": "<p>Isi artikel dalam format HTML...</p>",
  "status": "published"
}
```

**Body (lengkap):**
```json
{
  "title": "10 Warung Makan Terenak di Yogyakarta",
  "slug": "10-warung-makan-terenak-yogyakarta",
  "excerpt": "Panduan kuliner lengkap untuk kota Yogyakarta.",
  "content_html": "<h2>1. Warung Bu Tini</h2><p>...</p>",
  "content_markdown": "## 1. Warung Bu Tini\n\n...",
  "featured_image_url": "https://example.com/foto.jpg",
  "category_slug": "panduan-kuliner",
  "tags": ["yogyakarta", "warung", "rekomendasi"],
  "author_name": "Tim Foodmo",
  "status": "published",
  "published_at": "2025-04-25T07:00:00.000Z",
  "meta_title": "10 Warung Makan Terenak di Yogyakarta | Foodmo",
  "meta_description": "Temukan warung makan terbaik di Yogyakarta, dari gudeg hingga bakmi jawa."
}
```

> **Catatan**: Field `category_slug` akan di-resolve ke ID kategori secara otomatis. Pastikan slug kategori sudah ada di database.

**Response sukses (201):**
```json
{
  "success": true,
  "data": {
    "id": "cuid...",
    "title": "10 Warung Makan Terenak di Yogyakarta",
    "slug": "10-warung-makan-terenak-yogyakarta",
    "status": "published",
    ...
  }
}
```

---

### 5.2 Update Artikel

**`PATCH /api/external/articles/{id-atau-slug}`**

Membutuhkan permission: `articles:update`

Gunakan ID atau slug artikel sebagai parameter URL.

**Body (partial — hanya field yang ingin diubah):**
```json
{
  "title": "Judul artikel yang baru",
  "status": "published",
  "content_html": "<p>Konten terbaru...</p>"
}
```

**Response sukses (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 6. Endpoint Listing (Read-only via API Publik)

Listing saat ini hanya dapat dibaca melalui API publik (tanpa API key):

### 6.1 Daftar Listing

**`GET /api/listings`**

**Query params:**

| Param | Tipe | Deskripsi |
|-------|------|-----------|
| `search` | string | Cari berdasarkan nama/deskripsi/alamat |
| `category` | string | Filter slug kategori |
| `city` | string | Filter slug kota |
| `priceRange` | string | `murah` \| `sedang` \| `mahal` \| `premium` |
| `facility` | string | Filter fasilitas |
| `sort` | string | `latest` \| `rating` \| `name` \| `featured` |
| `page` | number | Nomor halaman (default: 1) |
| `limit` | number | Jumlah per halaman (default: 12) |

**Contoh request:**
```
GET /api/listings?city=yogyakarta&sort=rating&limit=5
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [ { "id": "...", "name": "...", "slug": "...", ... } ],
    "total": 42,
    "page": 1,
    "limit": 5,
    "totalPages": 9
  }
}
```

### 6.2 Detail Listing

**`GET /api/listings/{slug}`**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cuid...",
    "name": "Warung Bu Tini",
    "slug": "warung-bu-tini",
    "description": "...",
    "address": "Jl. Malioboro No. 1, Yogyakarta",
    "phone": "0812...",
    "whatsapp": "6281...",
    "websiteUrl": "https://...",
    "instagramUrl": "https://instagram.com/...",
    "shopeeFoodUrl": "https://...",
    "tiktokUrl": "https://...",
    "googleMapsUrl": "https://maps.app.goo.gl/...",
    "priceRange": "sedang",
    "rating": 4.5,
    "status": "published",
    "category": { "name": "Warung Makan", "slug": "warung-makan" },
    "city": { "name": "Yogyakarta", "slug": "yogyakarta" },
    "facilitiesList": ["WiFi", "Parkir"],
    "menuHighlightsList": ["Gudeg", "Bakmi Jawa"],
    "galleryImagesList": ["https://..."],
    ...
  }
}
```

---

## 7. Endpoints Listing (Tempat Makan)

**`POST /api/external/listings`**
Membuat listing baru. Memerlukan permission `listings:create`.

### Body Request (JSON):
- `name` (string, wajib)
- `description` (string, wajib)
- `address` (string, wajib)
- `latitude` (number, opsional) - Contoh: -6.2088
- `longitude` (number, opsional) - Contoh: 106.8456
- `phone`, `whatsapp`, `websiteUrl`, `instagramUrl`, `shopeeFoodUrl`, `tiktokUrl`, `googleMapsUrl` (string, opsional)
- `priceRange` (string, opsional) - `murah`, `sedang`, `mahal`, `premium`
- `featuredImageUrl` (string, opsional) - URL gambar utama
- `galleryImages` (array of string, opsional) - Kumpulan URL gambar galeri
- `status` (string, opsional) - `draft`, `published`, `archived`


**`PATCH /api/external/listings/{id-atau-slug}`**
Memperbarui listing yang ada. Memerlukan permission `listings:update`. Hanya kirim field yang ingin diubah.

---

## 8. Format Response Error

Semua error menggunakan format:
```json
{
  "success": false,
  "error": {
    "code": "KODE_ERROR",
    "message": "Pesan yang dapat dibaca manusia",
    "details": { }
  }
}
```

| HTTP Status | Kode | Penyebab |
|-------------|------|----------|
| 401 | `UNAUTHORIZED` | API key tidak disertakan atau tidak valid |
| 403 | `FORBIDDEN` | Permission tidak mencukupi atau rate limit |
| 404 | `NOT_FOUND` | Resource tidak ditemukan |
| 422 | `VALIDATION_ERROR` | Body request tidak valid |
| 500 | `SERVER_ERROR` | Error internal server |

---

## 8. Contoh Lengkap dengan curl

### Membuat artikel:
```bash
curl -X POST https://foodmo.id/api/external/articles \
  -H "Content-Type: application/json" \
  -H "x-api-key: dk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "title": "Kuliner Terbaik di Jakarta Selatan",
    "content_html": "<p>Jakarta Selatan memiliki banyak pilihan kuliner...</p>",
    "category_slug": "panduan-kuliner",
    "status": "published"
  }'
```

### Membuat listing (dengan koordinat latitude/longitude):
```bash
curl -X POST https://foodmo.id/api/external/listings \
  -H "Content-Type: application/json" \
  -H "x-api-key: dk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "name": "Nasi Goreng Gila Mentereng",
    "description": "Nasi goreng porsi besar dengan aneka topping melimpah.",
    "address": "Jl. Sabang No. 12, Menteng, Jakarta Pusat",
    "latitude": -6.185265,
    "longitude": 106.825126,
    "featuredImageUrl": "https://example.com/images/nasi-goreng-main.jpg",
    "galleryImages": [
      "https://example.com/images/nasi-goreng-1.jpg",
      "https://example.com/images/nasi-goreng-2.jpg"
    ],
    "status": "published"
  }'
```


### Update artikel:
```bash
curl -X PATCH https://foodmo.id/api/external/articles/kuliner-terbaik-jakarta-selatan \
  -H "Content-Type: application/json" \
  -H "x-api-key: dk_xxx..." \
  -d '{"status": "published", "meta_description": "Panduan kuliner Jakarta Selatan terlengkap."}'
```

### Baca listing:
```bash
curl "https://foodmo.id/api/listings?city=jakarta&sort=rating"
```

---

## 9. Contoh Python (untuk Agent AI)

```python
import httpx

BASE_URL = "https://foodmo.id"
API_KEY = "dk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
}

def create_article(title: str, content_html: str, category_slug: str = None) -> dict:
    payload = {
        "title": title,
        "content_html": content_html,
        "status": "published",
    }
    if category_slug:
        payload["category_slug"] = category_slug

    resp = httpx.post(f"{BASE_URL}/api/external/articles", json=payload, headers=HEADERS)
    resp.raise_for_status()
    return resp.json()["data"]

def update_article(id_or_slug: str, updates: dict) -> dict:
    resp = httpx.patch(
        f"{BASE_URL}/api/external/articles/{id_or_slug}",
        json=updates,
        headers=HEADERS,
    )
    resp.raise_for_status()
    return resp.json()["data"]

def get_listings(city: str = None, sort: str = "rating", limit: int = 10) -> list:
    params = {"sort": sort, "limit": limit}
    if city:
        params["city"] = city
    resp = httpx.get(f"{BASE_URL}/api/listings", params=params)
    resp.raise_for_status()
    return resp.json()["data"]["items"]
```

---

## 10. Catatan Penting

- **Slug unik**: Jika slug sudah dipakai, pembuatan artikel akan gagal dengan error `Slug "..." sudah dipakai`.
- **`category_slug` harus valid**: Pastikan slug kategori sudah dibuat di admin sebelum digunakan.
- **API key rahasia**: Jangan commit API key ke repository. Gunakan environment variable.
- **Status `published`**: Set `status: "published"` agar konten langsung tampil di publik. Default adalah `"draft"`.
- **`published_at` otomatis**: Jika status `published` dan `published_at` tidak diisi, waktu sekarang digunakan otomatis.
