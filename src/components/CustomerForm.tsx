import { useState } from "react";
import type { Customer } from "@/lib/types";

type Nilai = Omit<Customer, "id" | "sejak">;

type Props = {
  initial?: Customer;
  onSubmit: (data: Nilai) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring";
const labelClass = "mb-1 block text-xs font-semibold text-muted-foreground";

export function CustomerForm({ initial, onSubmit, onCancel }: Props) {
  const [nilai, setNilai] = useState<Nilai>({
    nama: initial?.nama ?? "",
    kode: initial?.kode ?? "",
    alamat: initial?.alamat ?? "",
    noHp: initial?.noHp ?? "",
  });

  const set = (k: keyof Nilai) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNilai((p) => ({ ...p, [k]: e.target.value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nilai.nama.trim()) return;
        onSubmit(nilai);
      }}
    >
      <div>
        <label className={labelClass}>Nama Customer</label>
        <input className={inputClass} value={nilai.nama} onChange={set("nama")} required />
      </div>
      <div>
        <label className={labelClass}>Kode Customer</label>
        <input
          className={inputClass}
          value={nilai.kode}
          onChange={set("kode")}
          placeholder="CUST-000"
        />
      </div>
      <div>
        <label className={labelClass}>Alamat</label>
        <input className={inputClass} value={nilai.alamat} onChange={set("alamat")} />
      </div>
      <div>
        <label className={labelClass}>No. HP</label>
        <input
          className={inputClass}
          value={nilai.noHp}
          onChange={set("noHp")}
          inputMode="tel"
          placeholder="+62 812-0000-0000"
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border bg-surface py-3 text-sm font-semibold"
        >
          Batal
        </button>
        <button
          type="submit"
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-brand"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
