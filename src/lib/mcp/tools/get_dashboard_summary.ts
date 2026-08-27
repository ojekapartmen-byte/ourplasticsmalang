import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_dashboard_summary",
  title: "Ringkasan dashboard",
  description: "Tampilkan ringkasan jumlah customer, total order, dan total nilai penjualan.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const [{ data: customers }, { data: orders }] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("jumlah, harga, status", { count: "exact", head: true }),
    ]);

    const totalCustomer = customers?.length ?? 0;
    const totalOrder = orders?.length ?? 0;
    const totalValue = (orders ?? []).reduce((sum, o) => sum + (o.harga || 0) * (o.jumlah || 0), 0);
    const lunas = (orders ?? []).filter((o) => o.status === "Lunas").length;
    const belumLunas = (orders ?? []).filter((o) => o.status === "Belum Lunas").length;
    const dp = (orders ?? []).filter((o) => o.status === "DP").length;

    const text = [
      "Ringkasan Our Plastics:",
      `- Total customer: ${totalCustomer}`,
      `- Total order: ${totalOrder}`,
      `- Total nilai penjualan: Rp ${totalValue.toLocaleString("id-ID")}`,
      `- Status pembayaran: Lunas ${lunas}, DP ${dp}, Belum Lunas ${belumLunas}`,
    ].join("\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: { totalCustomer, totalOrder, totalValue, statusBreakdown: { lunas, dp, belumLunas } },
    };
  },
});
