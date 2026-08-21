import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CustomerCard, CustomerRow } from "@/components/CustomerCard";
import { CustomerForm } from "@/components/CustomerForm";
import { Sheet } from "@/components/Sheet";
import { useData } from "@/lib/data-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard Customer — Our Plastics" },
      {
        name: "description",
        content:
          "Dashboard admin Our Plastics untuk mencari customer, melihat riwayat pembelian, dan mengelola data pesanan plastik.",
      },
      { property: "og:title", content: "Dashboard Customer — Our Plastics" },
      {
        property: "og:description",
        content: "Kelola data customer dan riwayat pesanan Our Plastics dari satu dashboard mobile.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { customers, search, addCustomer } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const hasil = useMemo(() => search(query), [search, query]);
  const sedangMencari = query.trim().length > 0;

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-md">
        <SearchBar value={query} onChange={setQuery} />
      </header>

      <main className="mx-auto max-w-md space-y-8 px-4 pt-6">
        {sedangMencari ? (
          <section>
            <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Hasil Pencarian ({hasil.length})
            </h2>
            {hasil.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
                Tidak ada customer yang cocok dengan "{query}".
              </p>
            ) : (
              <div className="space-y-3">
                {hasil.map((c) => (
                  <CustomerRow key={c.id} customer={c} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section>
              <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Pelanggan Terbaru
              </h2>
              <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {customers.slice(0, 6).map((c) => (
                  <CustomerCard key={c.id} customer={c} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Semua Customer
              </h2>
              <div className="space-y-3">
                {customers.map((c) => (
                  <CustomerRow key={c.id} customer={c} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <button
        type="button"
        onClick={() => setFormOpen(true)}
        aria-label="Tambah customer baru"
        className="fixed right-6 bottom-6 z-40 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-brand transition-transform active:scale-95"
      >
        <Plus className="size-6" />
      </button>

      <Sheet open={formOpen} title="Tambah Customer" onClose={() => setFormOpen(false)}>
        <CustomerForm
          onCancel={() => setFormOpen(false)}
          onSubmit={(data) => {
            const dibuat = addCustomer(data);
            setFormOpen(false);
            navigate({ to: "/customer/$id", params: { id: dibuat.id } });
          }}
        />
      </Sheet>
    </div>
  );
}
