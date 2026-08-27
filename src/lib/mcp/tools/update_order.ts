import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_order",
  title: "Edit order",
  description: "Perbarui data pesanan berdasarkan ID. Hanya kirim field yang ingin diubah.",
  inputSchema: {
    id: z.string().uuid().describe("UUID order."),
    nama_produk: z.string().min(1).optional().describe("Nama produk."),
    jumlah: z.number().int().min(1).optional().describe("Jumlah produk."),
    satuan: z.string().optional().describe("Satuan produk."),
    harga: z.number().int().min(0).optional().describe("Harga satuan dalam Rupiah."),
    status: z.enum(["Lunas", "DP", "Belum Lunas"]).optional().describe("Status pembayaran."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, nama_produk, jumlah, satuan, harga, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const updateData: Record<string, unknown> = {};
    if (nama_produk !== undefined) updateData["nama_produk"] = nama_produk;
    if (jumlah !== undefined) updateData["jumlah"] = jumlah;
    if (satuan !== undefined) updateData["satuan"] = satuan;
    if (harga !== undefined) updateData["harga"] = harga;
    if (status !== undefined) updateData["status"] = status;

    if (Object.keys(updateData).length === 0) {
      throw new ToolError("Tidak ada field yang diberikan untuk diperbarui.");
    }

    const { data: row, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .select("id, customer_id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .single();

    if (error) throw new ToolError(error.message);

    return {
      content: [{ type: "text", text: `Order "${row.nama_produk}" berhasil diperbarui.` }],
      structuredContent: { order: row },
    };
  },
});
