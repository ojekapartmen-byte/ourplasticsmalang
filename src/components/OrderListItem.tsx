import { ImageOff, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatRupiah, type Order } from "@/lib/types";
import { useProductImageUrl } from "@/hooks/use-product-image-url";

type Props = {
  order: Order;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
};

export function OrderListItem({ order, onEdit, onDelete }: Props) {
  const imageUrl = useProductImageUrl(order.imagePath);

  return (
    <div className="flex gap-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={order.namaProduk}
          loading="lazy"
          width={512}
          height={512}
          className="size-16 shrink-0 rounded-xl border border-border object-cover"
        />
      ) : (
        <div className="grid size-16 shrink-0 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
          <ImageOff className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-semibold">{order.namaProduk}</h4>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {order.jumlah} {order.satuan} • {formatRupiah(order.harga)}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{order.tanggal}</p>
        {(onEdit || onDelete) && (
          <div className="mt-2 flex gap-3">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(order)}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"
              >
                <Pencil className="size-3" /> Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(order)}
                className="flex items-center gap-1 text-[11px] font-semibold text-danger"
              >
                <Trash2 className="size-3" /> Hapus
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
