import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from "./customers.functions";
import {
  listOrdersByCustomer,
  createOrder,
  updateOrder,
  deleteOrder,
} from "./orders.functions";
import type { Customer, Order } from "./types";

export const customersKey = ["customers"] as const;
export const customerKey = (id: string) => ["customer", id] as const;
export const ordersKey = (customerId: string) => ["orders", customerId] as const;
export const searchKey = (q: string) => ["search", q] as const;

export function useCustomers() {
  const fetchCustomers = useServerFn(listCustomers);
  return useSuspenseQuery({
    queryKey: customersKey,
    queryFn: () => fetchCustomers(),
  });
}

export function useCustomer(id: string) {
  const fetchCustomer = useServerFn(getCustomer);
  return useQuery({
    queryKey: customerKey(id),
    queryFn: () => fetchCustomer({ data: { id } }),
    enabled: !!id,
  });
}

export function useSearchCustomers(q: string) {
  const fetchSearch = useServerFn(searchCustomers);
  return useQuery({
    queryKey: searchKey(q),
    queryFn: () => fetchSearch({ data: { q } }),
    enabled: q.trim().length > 0,
  });
}

export function useOrders(customerId: string) {
  const fetchOrders = useServerFn(listOrdersByCustomer);
  return useQuery({
    queryKey: ordersKey(customerId),
    queryFn: () => fetchOrders({ data: { customerId } }),
    enabled: !!customerId,
  });
}

export function useCustomerMutations() {
  const queryClient = useQueryClient();
  const createFn = useServerFn(createCustomer);
  const updateFn = useServerFn(updateCustomer);
  const deleteFn = useServerFn(deleteCustomer);

  const create = useMutation({
    mutationFn: (data: Omit<Customer, "id" | "sejak">) => createFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Customer, "id" | "sejak"> }) =>
      updateFn({ data: { id, data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  });

  return { create, update, remove };
}

export function useOrderMutations(customerId: string) {
  const queryClient = useQueryClient();
  const createFn = useServerFn(createOrder);
  const updateFn = useServerFn(updateOrder);
  const deleteFn = useServerFn(deleteOrder);

  const create = useMutation({
    mutationFn: (data: Omit<Order, "id" | "tanggal">) => createFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey(customerId) }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Order, "id" | "tanggal" | "customerId"> }) =>
      updateFn({ data: { id, data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey(customerId) }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersKey(customerId) }),
  });

  return { create, update, remove };
}

// Provider tidak lagi dibutuhkan; komponen lama yang mengimport DataProvider
// tetap bisa dipakai sebagai no-op wrapper agar tidak rusak.
export function DataProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Fungsi untuk mengisi data contoh (Demo Data) menggunakan Server Function
export async function seedDemoData() {
  try {
    await createCustomer({
      data: {
        nama: "Toko Plastik Makmur",
        kode: "CUST-001",
        alamat: "Jl. Pasar Besar No. 12",
        no_hp: "081122334455",
      },
    });

    await createCustomer({
      data: {
        nama: "Budi Santoso",
        kode: "CUST-002",
        alamat: "Jl. Melati No. 45",
        no_hp: "089988776655",
      },
    });
  } catch (error: any) {
    throw new Error(error.message || "Gagal mengisi data contoh");
  }
}
