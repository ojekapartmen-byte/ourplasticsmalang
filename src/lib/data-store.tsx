import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { deleteProductImage } from "./storage";
import type { Customer, Order } from "./types";

const customersKey = ["customers"] as const;
const ordersKey = (customerId: string) => ["orders", customerId] as const;

export function useData() {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: customersKey,
    queryFn: () => listCustomers(),
  });

  const customers = (customersQuery.data ?? []) as Customer[];

  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  });

  const updateCustomerMutation = useMutation({
    mutationFn: updateCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ordersKey(vars.customerId) });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: async (_, vars) => {
      const order = queryClient.getQueryData<Order[]>(ordersKey(""));
      const customerId = order?.find((o) => o.id === vars.id)?.customerId;
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: ordersKey(customerId) });
      }
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
  });

  const getCustomer = (id: string) => customers.find((c) => c.id === id);

  const ordersOf = (customerId: string) => {
    const query = useQuery({
      queryKey: ordersKey(customerId),
      queryFn: () => listOrdersByCustomer({ data: { customerId } }),
      enabled: !!customerId,
    });
    return query.data ?? [];
  };

  const addCustomer = async (data: Omit<Customer, "id" | "sejak">) => {
    const created = await createCustomerMutation.mutateAsync(data);
    return created;
  };

  const updateCustomerFn = async (id: string, data: Omit<Customer, "id" | "sejak">) => {
    await updateCustomerMutation.mutateAsync({ data: { id, data } });
  };

  const deleteCustomerFn = async (id: string) => {
    await deleteCustomerMutation.mutateAsync({ data: { id } });
  };

  const addOrder = async (data: Omit<Order, "id" | "tanggal">) => {
    await createOrderMutation.mutateAsync({
      data: {
        customerId: data.customerId,
        namaProduk: data.namaProduk,
        jumlah: data.jumlah,
        satuan: data.satuan,
        harga: data.harga,
        status: data.status,
        imageUrl: data.imageUrl,
      },
    });
  };

  const updateOrderFn = async (id: string, data: Omit<Order, "id" | "tanggal" | "customerId">) => {
    await updateOrderMutation.mutateAsync({
      data: {
        id,
        data: {
          namaProduk: data.namaProduk,
          jumlah: data.jumlah,
          satuan: data.satuan,
          harga: data.harga,
          status: data.status,
          imageUrl: data.imageUrl,
        },
      },
    });
  };

  const deleteOrderFn = async (id: string) => {
    await deleteOrderMutation.mutateAsync({ data: { id } });
  };

  const search = async (q: string) => {
    if (!q.trim()) return [] as Customer[];
    return searchCustomers({ data: { q } });
  };

  return {
    customers,
    ordersOf,
    getCustomer,
    addCustomer,
    updateCustomer: updateCustomerFn,
    deleteCustomer: deleteCustomerFn,
    addOrder,
    updateOrder: updateOrderFn,
    deleteOrder: deleteOrderFn,
    search,
  };
}

// Provider tidak lagi dibutuhkan; komponen lama yang mengimport DataProvider
// tetap bisa dipakai sebagai no-op wrapper agar tidak rusak.
export function DataProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
