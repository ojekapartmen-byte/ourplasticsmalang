import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const demoCustomers = [
  {
    nama: "PT Maju Jaya Plastik",
    kode: "CUST-001",
    alamat: "Jl. Raya Industri No. 12, Malang",
    no_hp: "081234567890",
  },
  {
    nama: "Toko Plastik Sejahtera",
    kode: "CUST-002",
    alamat: "Jl. Soekarno-Hatta No. 45, Malang",
    no_hp: "082345678901",
  },
  {
    nama: "UD Sumber Rejeki",
    kode: "CUST-003",
    alamat: "Jl. A. Yani No. 78, Malang",
    no_hp: "083456789012",
  },
];

const demoOrders = [
  {
    nama_produk: "Kantong Plastik PE Bening",
    jumlah: 50,
    satuan: "Roll",
    harga: 2500000,
    status: "Lunas",
    image_url: null,
  },
  {
    nama_produk: "Tas Belanja Eco Friendly",
    jumlah: 100,
    satuan: "Pack",
    harga: 1800000,
    status: "DP",
    image_url: null,
  },
  {
    nama_produk: "Plastik Sampah Hitam 60x100",
    jumlah: 30,
    satuan: "Pack",
    harga: 900000,
    status: "Belum Lunas",
    image_url: null,
  },
];

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: existing, error: countError } = await context.supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);

    if (countError) throw countError;

    // Hanya seed jika belum ada customer
    if ((existing?.length ?? 0) > 0) {
      return { seeded: false, reason: "Data sudah ada" };
    }

    for (const customer of demoCustomers) {
      const { data: row, error: insertError } = await context.supabase
        .from("customers")
        .insert({ ...customer, user_id: context.userId })
        .select("id")
        .single();

      if (insertError || !row) throw insertError;

      for (const order of demoOrders) {
        const { error: orderError } = await context.supabase.from("orders").insert({
          ...order,
          customer_id: row.id,
          user_id: context.userId,
          tanggal: new Date().toISOString(),
        });
        if (orderError) throw orderError;
      }
    }

    return { seeded: true };
  });
