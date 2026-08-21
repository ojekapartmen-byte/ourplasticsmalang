import type { StatusPembayaran } from "@/lib/types";

const styles: Record<StatusPembayaran, string> = {
  Lunas: "text-success bg-success-soft border-success/20",
  DP: "text-warning bg-warning-soft border-warning/20",
  "Belum Lunas": "text-danger bg-danger-soft border-danger/20",
};

export function StatusBadge({ status }: { status: StatusPembayaran }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}
