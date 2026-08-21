import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { OrderListItem } from "@/components/OrderListItem";
import { CustomerForm } from "@/components/CustomerForm";
import { OrderForm } from "@/components/OrderForm";
import { Sheet } from "@/components/Sheet";
import { useData } from "@/lib/data-store";
import { formatRupiah, type Order } from "@/lib/types";

export const Route = createFileRoute("/customer/$id")({
  head: () => ({
    meta: [
      { title: "Detail Customer — Our Plastics" },
      {
        name: "description",
        content:
          "Lihat data customer Our Plastics beserta riwayat pembelian dan status pembayaran tiap produk.",
      },
      { property: "og:title", content: "Detail Customer — Our Plastics" },
      {
        property: "og:description",
        content: "Data customer, riwayat pembelian, dan status pembayaran Our Plastics.",
      },
    ],
  }),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { getCustomer, ordersOf, updateCustomer, deleteCustomer, addOrder, updateOrder, deleteOrder } =
    useData();

  const customer = getCustomer(id);
  const [editCustomer, setEditCustomer] = useState(false);
  const [orderForm, setOrderForm] = useState<{ open: boolean; order?: Order }>({ open: false });
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  if (!customer) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-muted-foreground">Customer tidak ditemukan.</p>
        <Link to="/" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const orders = ordersOf(customer.id);
  const total = orders.reduce((s, o) => s + o.harga, 0);

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <Link
            to="/"
            aria-label="Kembali"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="truncate text-sm font-bold">{customer.nama}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 pt-6">
        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
          <div className="border-b border-border-subtle bg-surface-muted/60 p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold">{customer.nama}</h2>
                <p className="text-sm text-muted-foreground">
                  {customer.kode} • Sejak {customer.sejak}
                </p>
              </div>
              <span className="shrink-0 rounded-md bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground uppercase">
                Aktif
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="min-w-0">{customer.alamat}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                <span className="min-w-0">{customer.noHp}</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="text-sm font-bold">Riwayat Pembelian</h3>
              <span className="text-xs text-muted-foreground">Total {formatRupiah(total)}</span>
            </div>

            {orders.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada pesanan untuk customer ini.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <OrderListItem
                    key={o.id}
                    order={o}
                    onEdit={(order) => setOrderForm({ open: true, order })}
                    onDelete={(order) => deleteOrder(order.id)}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setOrderForm({ open: true })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground"
            >
              <Plus className="size-4" /> Tambah Pesanan Baru
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setEditCustomer(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-contrast py-3 text-sm font-bold text-contrast-foreground"
          >
            <Pencil className="size-4" /> Edit Data
          </button>
          <button
            type="button"
            onClick={() => setKonfirmasiHapus(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-danger/30 bg-danger-soft py-3 text-sm font-bold text-danger"
          >
            <Trash2 className="size-4" /> Hapus
          </button>
        </section>
      </main>

      <Sheet open={editCustomer} title="Edit Data Customer" onClose={() => setEditCustomer(false)}>
        <CustomerForm
          initial={customer}
          onCancel={() => setEditCustomer(false)}
          onSubmit={(data) => {
            updateCustomer(customer.id, data);
            setEditCustomer(false);
          }}
        />
      </Sheet>

      <Sheet
        open={orderForm.open}
        title={orderForm.order ? "Edit Produk / Order" : "Tambah Produk / Order"}
        onClose={() => setOrderForm({ open: false })}
      >
        <OrderForm
          initial={orderForm.order}
          onCancel={() => setOrderForm({ open: false })}
          onSubmit={(data) => {
            if (orderForm.order) updateOrder(orderForm.order.id, data);
            else addOrder({ ...data, customerId: customer.id });
            setOrderForm({ open: false });
          }}
        />
      </Sheet>

      <Sheet open={konfirmasiHapus} title="Hapus Customer" onClose={() => setKonfirmasiHapus(false)}>
        <p className="text-sm text-muted-foreground">
          Yakin ingin menghapus <strong className="text-foreground">{customer.nama}</strong> beserta
          seluruh riwayat pesanannya? Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setKonfirmasiHapus(false)}
            className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              deleteCustomer(customer.id);
              navigate({ to: "/" });
            }}
            className="flex-1 rounded-xl bg-danger py-3 text-sm font-bold text-danger-foreground"
          >
            Hapus
          </button>
        </div>
      </Sheet>
    </div>
  );
}
