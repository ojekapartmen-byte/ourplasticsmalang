import { useState } from "react";
import type { Customer } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";

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
    logoUrl: initial?.logoUrl ?? null,
    logoPath: initial?.logoPath ?? null,
  });
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof Nilai) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNilai((p) => ({ ...p, [k]: e.target.value }));

  // Handler untuk mengunggah file langsung ke Storage backend
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36.substring(2))}.${fileExt}`;
      const filePath = `${fileName}`;

      // Mengunggah file ke storage bucket (menggunakan bucket standar "product-images")
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Mendapatkan Public URL dari file yang baru diunggah
      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      setNilai((p) => ({
        ...p,
        logoUrl: publicUrlData.publicUrl,
        logoPath: filePath,
      }));
      toast.success("Logo berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah logo: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setUploading(false);
    }
  };

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

      {/* Input Upload Logo / Thumbnail Customer */}
      <div>
        <label className={labelClass}>Logo / Thumbnail Customer</label>
        <div className="flex items-center gap-4 mt-1">
          {nilai.logoUrl ? (
            <div className="relative size-14 overflow-hidden rounded-full border border-border bg-surface-muted shrink-0 group">
              <img src={nilai.logoUrl} alt="Logo Preview" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setNilai((p) => ({ ...p, logoUrl: null, logoPath: null }))}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold"
              >
                Hapus
              </button>
            </div>
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-border bg-surface-muted text-muted-foreground text-xs font-medium shrink-0">
              {uploading ? "..." : "Foto"}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            disabled={uploading}
            className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer w-full"
          />
        </div>
        {uploading && <p className="text-[11px] text-primary mt-1">Sedang mengunggah gambar...</p>}
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
          disabled={uploading}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-brand disabled:opacity-50"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
