# Plastics Admin Panel

Buatkan sebuah Mobile-First Web Application untuk "Customer Management Dashboard Our Plastics". Aplikasi ini dirancang khusus untuk satu orang Admin. Gunakan desain UI yang bersih, modern, dan sangat responsif untuk layar HP (Mobile UI/UX). Gunakan Tailwind CSS dan Lucide Icons.

Aplikasi ini membutuhkan Database dan Storage (Image Upload) (gunakan Lofable Cloud)

### 1. Struktur Halaman & Navigasi

- **Top Bar (Sticky):** Selalu ada di atas pada halaman Home. Berisi "Search Bar" global yang bisa mencari berdasarkan: Nama Customer, Kode Customer, Nama Produk, atau Alamat. 

- **Halaman Home (Default):** 

  - Menampilkan Search Bar di bagian atas.

  - Di bawahnya, tampilkan "Quick Access / Recent Customers" berupa list/grid kartu customer agar bisa diklik cepat.

  - Tombol "Floating Action Button" (FAB) di pojok kanan bawah untuk "Tambah Customer Baru".

### 2. Fitur Pencarian & Hasil (Search Results)

- Saat Admin mengetik di Search Bar, tampilkan hasil pencarian secara real-time.

- Hasil pencarian menampilkan List Customer yang relevan.

- Jika sebuah item customer diklik, akan masuk ke halaman "Customer Detail".

### 3. Halaman Customer Detail

Halaman ini menampilkan detail lengkap dari satu customer:

- **Informasi Utama:** Nama, Kode Customer, Alamat, dan Kontak.

- **Riwayat Pembelian (Order History):** List produk apa saja yang dibeli oleh customer ini.

- **Detail Item Produk:** Setiap produk yang dibeli harus menampilkan:

  - Image Produk (Thumbnail)

  - Nama Produk

  - Jumlah (Quantity)

  - Harga (Price)

  - Status Pembayaran (Badge berwarna: Lunas/Hijau, Belum Lunas/Merah, DP/Kuning).

- Tombol aksi: "Edit Data Customer", "Tambah Produk/Order", dan "Hapus".

### 4. Fitur CRUD & Form Input

- **Form Tambah/Edit Customer:** Input teks untuk Nama, Kode, Alamat, No HP.

- **Form Tambah/Edit Order/Produk:** 

  - Input teks untuk Nama Produk, Jumlah, Harga.

  - Dropdown untuk Status Pembayaran.

  - **Upload Image Component:** Area drag & drop atau klik untuk upload foto produk. Siapkan komponen ini agar mudah disambungkan ke Supabase Storage Bucket.

### 5. Technical Requirements

- Buat mock data (dummy data) terlebih dahulu agar desain UI bisa langsung terlihat sebelum saya menyambungkannya ke Supabase.

- Pisahkan komponen secara modular (misal: SearchBar, CustomerCard, OrderListItem, UploadImageForm).

- Gunakan state management yang baik agar pencarian terasa instan. Smua Item pakai bhasa Indonesia.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ourplasticsmalang.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/826f183d-f6f1-4577-b7fe-9684ccabe7b6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
