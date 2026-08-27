import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_customer",
  title: "Edit customer",
  description: "Perbarui data customer berdasarkan ID. Hanya kirim field yang ingin diubah.",
  inputSchema: {
    id: z.string().uuid().describe("UUID customer."),
    nama: z.string().min(1).optional().describe("Nama customer."),
    kode: z.string().min(1).optional().describe("Kode customer."),
    alamat: z.string().optional().describe("Alamat customer."),
    no_hp: z.string().optional().describe("Nomor HP customer."),
  },
  outputSchema: undefined,
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ id, nama, kode, alamat, no_hp }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const updateData: Record<string, unknown> = {};
    if (nama !== undefined) updateData["nama"] = nama;
    if (kode !== undefined) updateData["kode"] = kode;
    if (alamat !== undefined) updateData["alamat"] = alamat;
    if (no_hp !== undefined) updateData["no_hp"] = no_hp;

    if (Object.keys(updateData).length === 0) {
      throw new ToolError("Tidak ada field yang diberikan untuk diperbarui.");
    }

    const { data: row, error } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", ctx.getUserId())
      .select("id, nama, kode, alamat, no_hp, created_at, logo_url, logo_path")
      .single();

    if (error) throw new ToolError(error.message);

    return {
      content: [{ type: "text", text: `Customer "${row.nama}" (${row.kode}) berhasil diperbarui.` }],
      structuredContent: { customer: row },
    };
  },
});
