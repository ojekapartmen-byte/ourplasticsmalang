import { useState } from "react";
import { UploadImageForm } from "./UploadImageForm";
import { STATUS_OPTIONS, type Order, type StatusPembayaran } from "@/lib/types";

type Nilai = {
  namaProduk: string;
  jumlah: number;
  satuan: string;
  harga: number;
  status: StatusPembayaran;
  imageUrl: string | null;
};

type Props = {
  initial?: Order | undefined;
  onSubmit: (data: Nilai) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-ring";
const labelClass = "mb-1 block text-xs font-semibold text-muted-foreground";

export function OrderForm({ initial, onSubmit, onCancel }: Props) {
  const [nilai, setNilai] = useState<Nilai>({
    namaProduk: initial?.namaProduk ?? "",
    jumlah: initial?.jumlah ?? 1,
    satuan: initial?.satuan ?? "Pcs",
    harga: initial?.harga ?? 0,
    status: initial?.status ?? "Belum Lunas",
    imageUrl: initial?.imageUrl ?? null,
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!nilai.namaProduk.trim()) return;
        onSubmit(nilai);
      }}
    >
      <div>
        <label className={labelClass}>Nama Produk</label>
        <input
          className={inputClass}
          value={nilai.namaProduk}
          onChange={(e) => setNilai((p) => ({ ...p, namaProduk: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Jumlah</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={nilai.jumlah}
            onChange={(e) => setNilai((p) => ({ ...p, jumlah: Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className={labelClass}>Satuan</label>
          <input
            className={inputClass}
            value={nilai.satuan}
            onChange={(e) => setNilai((p) => ({ ...p, satuan: e.target.value }))}
            placeholder="Roll / Pack / Pcs"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Harga (Rp)</label>
        <input
          type="number"
          min={0}
          className={inputClass}
          value={nilai.harga}
          onChange={(e) => setNilai((p) => ({ ...p, harga: Number(e.target.value) }))}
        />
      </div>

      <div>
        <label className={labelClass}>Status Pembayaran</label>
        <select
          className={inputClass}
          value={nilai.status}
          onChange={(e) => setNilai((p) => ({ ...p, status: e.target.value as StatusPembayaran }))}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <UploadImageForm
        value={nilai.imageUrl}
        onChange={(path) => setNilai((p) => ({ ...p, imageUrl: path }))}
      />

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
