import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { uploadProductImage, deleteProductImage, getProductImageUrl } from "@/lib/storage";

type Props = {
  value: string | null;
  onChange: (path: string | null) => void;
  label?: string;
};

export function UploadImageForm({ value, onChange, label = "Foto Produk" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleRemove = async () => {
    await deleteProductImage(value);
    onChange(null);
    setPreviewUrl(null);
  };

  const prosesFile = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const path = await uploadProductImage(file);
      const url = await getProductImageUrl(path);
      onChange(path);
      setPreviewUrl(url);
    } catch (err) {
      console.error("Upload gagal:", err);
    }
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</label>
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <img
            src={previewUrl ?? value}
            alt="Pratinjau produk"
            className="h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus foto"
            className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-contrast text-contrast-foreground"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            prosesFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 transition-colors ${
            dragging ? "border-primary bg-primary-light" : "border-border bg-surface-muted"
          }`}
        >
          <ImagePlus className="size-6 text-muted-foreground" />
          <span className="text-xs font-semibold">Ketuk untuk unggah atau seret foto</span>
          <span className="text-[10px] text-muted-foreground">Format JPG, PNG (Maks 5MB)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => prosesFile(e.target.files?.[0])}
      />
    </div>
  );
}
