import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_customers",
  title: "Cari customer",
  description: "Cari customer berdasarkan nama, kode, alamat, nomor HP, atau nama produk yang pernah dipesan.",
  inputSchema: {
    q: z.string().min(1).describe("Kata kunci pencarian."),
  },
  outputSchema: undefined,
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ q }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);
    const term = q.trim().toLowerCase();

    const [{ data: customers }, { data: orders }] = await Promise.all([
      supabase
        .from("customers")
        .select("id, nama, kode, alamat, no_hp, created_at, logo_url, logo_path")
        .or(`nama.ilike.%${term}%,kode.ilike.%${term}%,alamat.ilike.%${term}%,no_hp.ilike.%${term}%`),
      supabase.from("orders").select("customer_id, nama_produk").ilike("nama_produk", `%${term}%`),
    ]);

    const customerIdsFromProducts = new Set((orders ?? []).map((o) => o.customer_id));
    const rows = (customers ?? []).filter(
      (c) =>
        [c.nama, c.kode, c.alamat, c.no_hp].some((f) => f?.toLowerCase().includes(term)) ||
        customerIdsFromProducts.has(c.id),
    );

    if (rows.length === 0) {
      return { content: [{ type: "text", text: "Tidak ditemukan customer untuk kata kunci tersebut." }] };
    }

    const summary = rows
      .map((c) => `- ${c.nama} (${c.kode}) | Alamat: ${c.alamat || "-"} | HP: ${c.no_hp || "-"} | ID: ${c.id}`)
      .join("\n");

    return {
      content: [
        { type: "text", text: `Ditemukan ${rows.length} customer:\n${summary}` },
      ],
      structuredContent: { customers: rows },
    };
  },
});
