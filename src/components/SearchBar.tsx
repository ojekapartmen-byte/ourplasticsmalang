import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative mx-auto max-w-md">
      <Search className="pointer-events-none absolute inset-y-0 left-3 my-auto size-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Cari Nama, Kode, Alamat, atau Produk..."}
        aria-label="Cari customer"
        className="w-full rounded-xl border-none bg-muted py-2.5 pr-10 pl-10 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Bersihkan pencarian"
          className="absolute inset-y-0 right-3 my-auto grid size-5 place-items-center rounded-full text-muted-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
