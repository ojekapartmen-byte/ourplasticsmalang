import { Link } from "@tanstack/react-router";
import { inisial, type Customer } from "@/lib/types";
import { useProductImageUrl } from "@/hooks/use-product-image-url";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

// Komponen pembantu untuk menampilkan logo customer (signed URL dari storage privat)
export function CustomerImage({ customer }: { customer: Customer }) {
  const [hasError, setHasError] = useState(false);
  const signed = useProductImageUrl(customer.logoPath);
  const url = signed ?? customer.logoUrl ?? null;

  if (!url || hasError) {
    // Placeholder ketika customer belum punya foto/logo
    return (
      <span className="flex size-full flex-col items-center justify-center gap-0.5 bg-surface-muted text-muted-foreground">
        <ImageIcon className="size-3.5" aria-hidden />
        <span className="text-[9px] leading-none font-bold text-primary">
          {inisial(customer.nama)}
        </span>
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={customer.nama}
      className="size-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}


export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <Link
      to="/customer/$id"
      params={{ id: customer.id }}
      className="w-32 flex-shrink-0 rounded-2xl border border-border bg-surface p-4 shadow-card transition-transform active:scale-[0.98]"
    >
      <div className="mb-3 flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">
        <CustomerImage customer={customer} />
      </div>
      <div className="truncate text-sm font-bold">{customer.nama}</div>
      <div className="text-[10px] text-muted-foreground">{customer.kode}</div>
    </Link>
  );
}

export function CustomerRow({ customer }: { customer: Customer }) {
  return (
    <Link
      to="/customer/$id"
      params={{ id: customer.id }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-transform active:scale-[0.99]"
    >
      <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
        <CustomerImage customer={customer} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{customer.nama}</div>
        <div className="truncate text-xs text-muted-foreground">
          {customer.kode} • {customer.alamat}
        </div>
      </div>
    </Link>
  );
}
