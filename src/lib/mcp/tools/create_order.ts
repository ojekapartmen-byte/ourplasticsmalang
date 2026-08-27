import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_order",
  title: "Tambah order",
  description: "Buat pesanan baru untuk customer tertentu.",
  inputSchema: {
    customer_id: z.string().uuid().describe("UUID customer."),
    nama_produk: z.string().min(1).describe("Nama produk."),
    jumlah: z.number().int().min(1).describe("Jumlah produk."),
    satuan: z.string().default("Pcs").describe("Satuan produk, misalnya Pcs, Kg, Dus."),
    harga: z.number().int().min(0).describe("Harga satuan dalam Rupiah."),
    status: z.enum(["Lunas", "DP", "Belum Lunas"]).describe("Status pembayaran."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ customer_id, nama_produk, jumlah, satuan, harga, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customer_id)
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (customerError) throw new ToolError(customerError.message);
    if (!customer) throw new ToolError("Customer tidak ditemukan atau bukan milik Anda.");

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        customer_id,
        nama_produk,
        jumlah,
        satuan,
        harga,
        status,
        user_id: ctx.getUserId(),
        image_url: null,
        tanggal: new Date().toISOString(),
      })
      .select("id, customer_id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .single();

    if (error) throw new ToolError(error.message);

    return {
      content: [
        {
          type: "text",
          text: `Order "${row.nama_produk}" (${row.jumlah} ${row.satuan}) berhasil dibuat dengan status ${row.status}.`,
        },
      ],
      structuredContent: { order: row },
    };
  },
});
