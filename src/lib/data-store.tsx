import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { mockCustomers, mockOrders } from "./mock-data";
import type { Customer, Order } from "./types";

type DataStore = {
  customers: Customer[];
  orders: Order[];
  getCustomer: (id: string) => Customer | undefined;
  ordersOf: (customerId: string) => Order[];
  addCustomer: (data: Omit<Customer, "id" | "sejak">) => Customer;
  updateCustomer: (id: string, data: Omit<Customer, "id" | "sejak">) => void;
  deleteCustomer: (id: string) => void;
  addOrder: (data: Omit<Order, "id" | "tanggal">) => void;
  updateOrder: (id: string, data: Omit<Order, "id" | "tanggal" | "customerId">) => void;
  deleteOrder: (id: string) => void;
  search: (q: string) => Customer[];
};

const Ctx = createContext<DataStore | null>(null);

const tanggalHariIni = () =>
  new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const getCustomer = useCallback((id: string) => customers.find((c) => c.id === id), [customers]);
  const ordersOf = useCallback(
    (customerId: string) => orders.filter((o) => o.customerId === customerId),
    [orders],
  );

  const addCustomer = useCallback((data: Omit<Customer, "id" | "sejak">) => {
    const created: Customer = { ...data, id: `c${Date.now()}`, sejak: tanggalHariIni() };
    setCustomers((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateCustomer = useCallback((id: string, data: Omit<Customer, "id" | "sejak">) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setOrders((prev) => prev.filter((o) => o.customerId !== id));
  }, []);

  const addOrder = useCallback((data: Omit<Order, "id" | "tanggal">) => {
    setOrders((prev) => [{ ...data, id: `o${Date.now()}`, tanggal: tanggalHariIni() }, ...prev]);
  }, []);

  const updateOrder = useCallback(
    (id: string, data: Omit<Order, "id" | "tanggal" | "customerId">) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));
    },
    [],
  );

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const search = useCallback(
    (q: string) => {
      const term = q.trim().toLowerCase();
      if (!term) return [];
      return customers.filter((c) => {
        const cocokCustomer = [c.nama, c.kode, c.alamat, c.noHp].some((f) =>
          f.toLowerCase().includes(term),
        );
        const cocokProduk = orders.some(
          (o) => o.customerId === c.id && o.namaProduk.toLowerCase().includes(term),
        );
        return cocokCustomer || cocokProduk;
      });
    },
    [customers, orders],
  );

  const value = useMemo(
    () => ({
      customers,
      orders,
      getCustomer,
      ordersOf,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addOrder,
      updateOrder,
      deleteOrder,
      search,
    }),
    [
      customers,
      orders,
      getCustomer,
      ordersOf,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addOrder,
      updateOrder,
      deleteOrder,
      search,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData harus dipakai di dalam DataProvider");
  return ctx;
}
