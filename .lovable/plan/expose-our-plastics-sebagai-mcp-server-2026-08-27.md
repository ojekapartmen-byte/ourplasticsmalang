# Expose Our Plastics sebagai MCP Server

## Tujuan
Menambahkan MCP server ke aplikasi Our Plastics sehingga AI assistant luar (ChatGPT, Claude, Cursor, dll.) dapat mengakses dan mengelola data customer & order melalui tools — dengan autentikasi OAuth 2.1 via Supabase Auth.

## Pilihan autentikasi
**OAuth 2.1 (Supabase Auth)** — direkomendasikan karena aplikasi memiliki akun pengguna dan data customer/order bersifat per-user serta dilindungi RLS. Tidak akan dibuat versi public tanpa autentikasi.

## Langkah Implementasi

### 1. Instalasi SDK
- Install `@lovable.dev/mcp-js` (zod sudah tersedia).
- Pastikan `bunfig.toml` sudah mengecualikan `@lovable.dev/mcp-js` dari supply-chain guard (sudah terlihat di konfigurasi).

### 2. Factory client Supabase untuk tools
- Buat `src/lib/mcp/supabase.ts` dengan builder `supabaseForUser(ctx)` untuk meneruskan bearer token ke Supabase sehingga RLS berjalan sebagai user yang login.
- Tidak menggunakan service role atau anon untuk data per-user.

### 3. Definisi tools MCP
Buat satu file per tool di `src/lib/mcp/tools/`:

| Tool | Fungsi |
|------|--------|
| `search_customers` | Cari customer berdasarkan nama, kode, alamat, no HP, atau nama produk yang pernah dipesan. |
| `get_customer` | Ambil detail customer berdasarkan ID. |
| `create_customer` | Tambah customer baru. |
| `update_customer` | Edit data customer. |
| `delete_customer` | Hapus customer. |
| `list_orders` | List semua order milik satu customer. |
| `create_order` | Tambah order untuk customer. |
| `update_order` | Edit order (produk, jumlah, harga, status pembayaran). |
| `delete_order` | Hapus order. |
| `get_dashboard_summary` | Ringkasan jumlah customer & total nilai order. |

Setiap tool:
- Menggunakan `supabaseForUser(ctx)`.
- Memeriksa autentikasi via `ctx.isAuthenticated()`.
- Mengembalikan hasil dalam format text/JSON yang mudah dibaca AI.

### 4. Entry MCP
- Buat `src/lib/mcp/index.ts` dengan `defineMcp`:
  - `name`: `plastics-admin-panel`
  - `title`: `Plastics Admin Panel`
  - `version`: `0.1.0`
  - `instructions`: penjelasan singkat cara menggunakan tools.
  - `auth`: OAuth issuer menggunakan direct Supabase host dari `VITE_SUPABASE_PROJECT_ID`.
  - Daftarkan semua tools di atas.

### 5. Vite plugin
- Update `vite.config.ts` untuk menambahkan `mcpPlugin()` dari `@lovable.dev/mcp-js/stacks/tanstack/vite`.
- Mount MCP server di `/mcp`.

### 6. OAuth consent route
- Buat `src/routes/[.]lovable.oauth.consent.tsx` sesuai pola TanStack Router untuk literal dot.
- Route ini menangani persetujuan koneksi dari AI client.
- Redirect user yang belum login ke `/auth` sambil mempertahankan URL consent (`next`).

### 7. Aktivasi OAuth server
- Jalankan `supabase--configure_oauth_server` agar Supabase Auth mengaktifkan OAuth 2.1 dan dynamic client registration.

### 8. Validasi manifest
- Jalankan `app_mcp_server--extract_mcp_manifest` setelah semua file tersimpan untuk memastikan manifest ter-generate dengan benar.

## Acceptance Criteria
- MCP server tersedia di `/mcp` setelah publish.
- Setiap tool memerlukan autentikasi OAuth dan RLS berjalan sebagai user yang login.
- AI client dapat mencari customer, membuka detail, serta membuat/mengubah/menghapus customer dan order.
- Consent route berfungsi dan user kembali ke Lovable connectors dialog setelah menyetujui.
- Manifest MCP valid dan ter-update.
