export type StatusPembayaran = "Lunas" | "DP" | "Belum Lunas";

export const STATUS_OPTIONS: StatusPembayaran[] = ["Lunas", "DP", "Belum Lunas"];

export type Order = {
  id: string;
  customerId: string;
  namaProduk: string;
  jumlah: number;
  satuan: string;
  harga: number;
  status: StatusPembayaran;
  tanggal: string;
  imageUrl: string | null;
  imagePath?: string | null;
};

export type Customer = {
  id: string;
  nama: string;
  kode: string;
  alamat: string;
  noHp: string;
  sejak: string;
};

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function inisial(nama: string): string {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function formatSejak(dateInput: string | Date | null): string {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

export function formatTanggal(dateInput: string | Date | null): string {
  if (!dateInput) return "-";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
