import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_customer",
  title: "Tambah customer",
  description: "Buat customer baru dengan nama, kode, alamat, dan nomor HP.",
  inputSchema: {
    nama: z.string().min(1).describe("Nama customer."),
    kode: z.string().min(1).describe("Kode customer (unik)."),
    alamat: z.string().default("").describe("Alamat customer."),
    no_hp: z.string().default("").describe("Nomor HP customer."),
  },
  outputSchema: undefined,
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ nama, kode, alamat, no_hp }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const { data: existing } = await supabase.from("customers").select("id").eq("kode", kode).maybeSingle();
    if (existing) throw new ToolError(`Kode customer "${kode}" sudah digunakan.`);

    const { data: row, error } = await supabase
      .from("customers")
      .insert({ nama, kode, alamat, no_hp, user_id: ctx.getUserId(), logo_url: null, logo_path: null })
      .select("id, nama, kode, alamat, no_hp, created_at, logo_url, logo_path")
      .single();

    if (error) throw new ToolError(error.message);

    return {
      content: [{ type: "text", text: `Customer "${row.nama}" (${row.kode}) berhasil dibuat dengan ID ${row.id}.` }],
      structuredContent: { customer: row },
    };
  },
});
