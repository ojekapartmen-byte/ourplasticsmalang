import { useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import type { Customer } from "@/lib/types";
import { uploadCustomerLogo } from "@/lib/storage";
import { useProductImageUrl } from "@/hooks/use-product-image-url";
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
  const fileRef = useRef<HTMLInputElement>(null);

  const hapusFoto = () => {
    setNilai((p) => ({ ...p, logoUrl: null, logoPath: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const set = (k: keyof Nilai) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNilai((p) => ({ ...p, [k]: e.target.value }));

  // Handler untuk mengunggah file langsung ke Storage backend (bucket privat)
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const filePath = await uploadCustomerLogo(file);
      setNilai((p) => ({ ...p, logoUrl: null, logoPath: filePath }));
      toast.success("Logo berhasil diunggah!");
    } catch (error: any) {
      toast.error("Gagal mengunggah logo: " + (error.message || "Terjadi kesalahan"));
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = useProductImageUrl(nilai.logoPath) ?? nilai.logoUrl;


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
        <div className="mt-1 flex items-center gap-4">
          {previewUrl ? (
            <div className="size-14 shrink-0 overflow-hidden rounded-full border border-border bg-surface-muted">
              <img src={previewUrl} alt="Pratinjau logo" className="size-full object-cover" />
            </div>
          ) : (
            <div className="flex size-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border border-dashed border-border bg-surface-muted text-muted-foreground">
              {uploading ? (
                <span className="text-xs font-medium">...</span>
              ) : (
                <>
                  <ImageIcon className="size-4" aria-hidden />
                  <span className="text-[9px] leading-none">Foto</span>
                </>
              )}
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50"
              >
                <Upload className="size-3.5" aria-hidden />
                {previewUrl ? "Ganti Foto" : "Pilih Foto"}
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={hapusFoto}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Hapus Foto
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {uploading
                ? "Sedang mengunggah gambar..."
                : previewUrl
                  ? "Perubahan foto tersimpan setelah menekan Simpan."
                  : "Belum ada foto. Format JPG/PNG."}
            </p>
          </div>
        </div>
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
