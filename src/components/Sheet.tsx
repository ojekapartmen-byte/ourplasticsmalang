import { X } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Sheet({ open, title, onClose, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-contrast/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
