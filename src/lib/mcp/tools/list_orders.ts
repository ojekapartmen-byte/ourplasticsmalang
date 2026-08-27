import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_orders",
  title: "List order customer",
  description: "Tampilkan semua pesanan milik satu customer.",
  inputSchema: {
    customer_id: z.string().uuid().describe("UUID customer."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ customer_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const { data: rows, error } = await supabase
      .from("orders")
      .select("id, customer_id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .eq("customer_id", customer_id)
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });

    if (error) throw new ToolError(error.message);

    if (!rows || rows.length === 0) {
      return { content: [{ type: "text", text: "Customer ini belum memiliki pesanan." }] };
    }

    const total = rows.reduce((sum, o) => sum + (o.harga || 0) * (o.jumlah || 0), 0);
    const summary = rows
      .map(
        (o) =>
          `- ${o.nama_produk}: ${o.jumlah} ${o.satuan} × Rp ${(o.harga || 0).toLocaleString("id-ID")} = Rp ${((o.harga || 0) * (o.jumlah || 0)).toLocaleString("id-ID")} [${o.status}]`,
      )
      .join("\n");

    return {
      content: [{ type: "text", text: `Total ${rows.length} order (Rp ${total.toLocaleString("id-ID")}):\n${summary}` }],
      structuredContent: { orders: rows },
    };
  },
});
