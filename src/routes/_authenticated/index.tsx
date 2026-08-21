import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, LogOut, Database } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { CustomerCard, CustomerRow } from "@/components/CustomerCard";
import { CustomerForm } from "@/components/CustomerForm";
import { Sheet } from "@/components/Sheet";
import { useCustomers, useCustomerMutations, useSearchCustomers, seedDemoData } from "@/lib/data-store";
import type { Customer } from "@/lib/types";
import { supabase } from "@/lib/supabase"; // Pastikan path ini sesuai dengan lokasi file supabase kamu
import toast, { Toaster } from "react-hot-toast";

export const Route = createFileRoute("/_authenticated/")({
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
  const { data: customers = [], refetch } = useCustomers();
  const { create } = useCustomerMutations();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const { data: searchResults = [] } = useSearchCustomers(query);
  const sedangMencari = query.trim().length > 0;

  const hasil = useMemo(() => (sedangMencari ? searchResults : []), [sedangMencari, searchResults]);

  // Fungsi Logout
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar: " + error.message);
    } else {
      toast.success("Berhasil keluar");
      navigate({ to: "/auth" });
    }
  };

  // Fungsi Isi Data Contoh
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedDemoData();
      toast.success("Data contoh berhasil ditambahkan!");
      refetch(); // Refresh data pelanggan setelah seed
    } catch (error: any) {
      toast.error("Gagal mengisi data: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Memasang Toaster untuk Notifikasi */}
      <Toaster position="top-center" />

      {/* Header dengan SearchBar dan Tombol Keluar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 px-4 py-3 backdrop-blur-md flex items-center gap-3">
        <div className="flex-1">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <button 
          onClick={handleSignOut}
          aria-label="Keluar"
          className="flex items-center justify-center rounded-full bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100 active:scale-95"
        >
          <LogOut className="size-5" />
        </button>
      </header>

      <main className="mx-auto max-w-md space-y-8 px-4 pt-6">
        
        {/* Tombol Isi Data Contoh (Hanya muncul jika belum ada customer dan tidak sedang mencari) */}
        {customers.length === 0 && !sedangMencari && (
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <Database className="size-4" />
            {isSeeding ? "Memproses Data..." : "Isi Data Contoh"}
          </button>
        )}

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
                {hasil.map((c: Customer) => (
                  <CustomerRow key={c.id} customer={c} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {customers.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Pelanggan Terbaru
                </h2>
                <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                  {customers.slice(0, 6).map((c: Customer) => (
                    <CustomerCard key={c.id} customer={c} />
                  ))}
                </div>
              </section>
            )}

            {customers.length > 0 && (
              <section>
                <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                  Semua Customer
                </h2>
                <div className="space-y-3">
                  {customers.map((c: Customer) => (
                    <CustomerRow key={c.id} customer={c} />
                  ))}
                </div>
              </section>
            )}
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
          onSubmit={async (data) => {
            try {
              const dibuat = await create.mutateAsync(data);
              setFormOpen(false);
              toast.success("Customer berhasil ditambahkan!");
              navigate({ to: "/customer/$id", params: { id: dibuat.id } });
            } catch (error) {
              toast.error("Gagal menambahkan customer");
            }
          }}
        />
      </Sheet>
    </div>
  );
}
