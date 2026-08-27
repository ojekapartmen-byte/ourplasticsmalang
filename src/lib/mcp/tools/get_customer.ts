import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_customer",
  title: "Detail customer",
  description: "Ambil detail lengkap customer beserta riwayat pesanan berdasarkan ID customer.",
  inputSchema: {
    id: z.string().uuid().describe("UUID customer."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, nama, kode, alamat, no_hp, created_at, logo_url, logo_path")
      .eq("id", id)
      .maybeSingle();

    if (customerError) throw new ToolError(customerError.message);
    if (!customer) throw new ToolError("Customer tidak ditemukan.");

    const { data: orders } = await supabase
      .from("orders")
      .select("id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    const totalOrderValue = (orders ?? []).reduce((sum, o) => sum + (o.harga || 0) * (o.jumlah || 0), 0);
    const orderList = (orders ?? [])
      .map(
        (o) =>
          `- ${o.nama_produk}: ${o.jumlah} ${o.satuan} × Rp ${(o.harga || 0).toLocaleString("id-ID")} = Rp ${((o.harga || 0) * (o.jumlah || 0)).toLocaleString("id-ID")} [${o.status}]`,
      )
      .join("\n") || "Belum ada pesanan.";

    const text = [
      `Nama: ${customer.nama}`,
      `Kode: ${customer.kode}`,
      `Alamat: ${customer.alamat || "-"}`,
      `No. HP: ${customer.no_hp || "-"}`,
      `Total nilai order: Rp ${totalOrderValue.toLocaleString("id-ID")}`,
      "",
      "Riwayat pesanan:",
      orderList,
    ].join("\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: { customer, orders: orders ?? [] },
    };
  },
});
