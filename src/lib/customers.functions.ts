import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Customer } from "./types";

const toCustomer = (row: {
  id: string;
  nama: string;
  kode: string;
  alamat: string;
  no_hp: string;
  created_at: string;
}): Customer => ({
  id: row.id,
  nama: row.nama,
  kode: row.kode,
  alamat: row.alamat,
  noHp: row.no_hp,
  sejak: new Date(row.created_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
});

const customerSchema = z.object({
  nama: z.string().min(1),
  kode: z.string().min(1),
  alamat: z.string().default(""),
  noHp: z.string().default(""),
});

export const listCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("customers")
      .select("id, nama, kode, alamat, no_hp, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(toCustomer);
  });

export const getCustomer = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("customers")
      .select("id, nama, kode, alamat, no_hp, created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Customer tidak ditemukan");
    return toCustomer(row);
  });

export const createCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => customerSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("customers")
      .insert({ ...data, user_id: context.userId })
      .select("id, nama, kode, alamat, no_hp, created_at")
      .single();
    if (error) throw error;
    return toCustomer(row);
  });

export const updateCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), data: customerSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("customers")
      .update(data.data)
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .select("id, nama, kode, alamat, no_hp, created_at")
      .single();
    if (error) throw error;
    return toCustomer(row);
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("customers")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const searchCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ q: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const term = data.q.trim().toLowerCase();
    if (!term) return [] as Customer[];

    const [{ data: customers }, { data: orders }] = await Promise.all([
      context.supabase
        .from("customers")
        .select("id, nama, kode, alamat, no_hp, created_at")
        .or(`nama.ilike.%${term}%,kode.ilike.%${term}%,alamat.ilike.%${term}%,no_hp.ilike.%${term}%`),
      context.supabase.from("orders").select("customer_id, nama_produk").ilike("nama_produk", `%${term}%`),
    ]);

    const customerIdsFromProducts = new Set((orders ?? []).map((o) => o.customer_id));
    const customerList = (customers ?? []).map(toCustomer);

    return customerList.filter(
      (c) =>
        [c.nama, c.kode, c.alamat, c.noHp].some((f) => f.toLowerCase().includes(term)) ||
        customerIdsFromProducts.has(c.id),
    );
  });
