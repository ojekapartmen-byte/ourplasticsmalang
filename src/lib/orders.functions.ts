import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Order, StatusPembayaran } from "./types";

const toOrder = (row: {
  id: string;
  customer_id: string;
  nama_produk: string;
  jumlah: number;
  satuan: string;
  harga: number;
  status: string;
  tanggal: string;
  image_url: string | null;
}): Order => ({
  id: row.id,
  customerId: row.customer_id,
  namaProduk: row.nama_produk,
  jumlah: row.jumlah,
  satuan: row.satuan,
  harga: row.harga,
  status: row.status as StatusPembayaran,
  tanggal: new Date(row.tanggal).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  imageUrl: row.image_url,
  imagePath: row.image_url,
});

const orderSchema = z.object({
  customerId: z.string().uuid(),
  namaProduk: z.string().min(1),
  jumlah: z.number().int().min(1),
  satuan: z.string().default("Pcs"),
  harga: z.number().int().min(0),
  status: z.enum(["Lunas", "DP", "Belum Lunas"]),
  imageUrl: z.string().nullable().default(null),
});

export const listOrdersByCustomer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ customerId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("orders")
      .select("id, customer_id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .eq("customer_id", data.customerId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (rows ?? []).map(toOrder);
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => orderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .insert({
        customer_id: data.customerId,
        nama_produk: data.namaProduk,
        jumlah: data.jumlah,
        satuan: data.satuan,
        harga: data.harga,
        status: data.status,
        image_url: data.imageUrl,
        user_id: context.userId,
      })
      .select("id, customer_id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .single();
    if (error) throw error;
    return toOrder(row);
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), data: orderSchema.omit({ customerId: true }) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("orders")
      .update({
        nama_produk: data.data.namaProduk,
        jumlah: data.data.jumlah,
        satuan: data.data.satuan,
        harga: data.data.harga,
        status: data.data.status,
        image_url: data.data.imageUrl,
      })
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id, customer_id, nama_produk, jumlah, satuan, harga, status, tanggal, image_url")
      .single();
    if (error) throw error;
    return toOrder(row);
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("orders").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
