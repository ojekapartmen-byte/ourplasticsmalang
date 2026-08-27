import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "delete_customer",
  title: "Hapus customer",
  description: "Hapus customer beserta seluruh riwayat pesanannya berdasarkan ID.",
  inputSchema: {
    id: z.string().uuid().describe("UUID customer."),
  },
  outputSchema: undefined,
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", ctx.getUserId());
    if (error) throw new ToolError(error.message);

    return { content: [{ type: "text", text: "Customer dan riwayat pesanannya berhasil dihapus." }] };
  },
});
