import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "delete_order",
  title: "Hapus order",
  description: "Hapus pesanan berdasarkan ID.",
  inputSchema: {
    id: z.string().uuid().describe("UUID order."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      throw new ToolError("Tidak terautentikasi. Hubungkan akun Our Plastics terlebih dahulu.");
    }
    const supabase = supabaseForUser(ctx);

    const { error } = await supabase.from("orders").delete().eq("id", id).eq("user_id", ctx.getUserId());
    if (error) throw new ToolError(error.message);

    return { content: [{ type: "text", text: "Order berhasil dihapus." }] };
  },
});
