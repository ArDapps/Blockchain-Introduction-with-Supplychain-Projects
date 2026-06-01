import type { ProductStatus } from "@/lib/types";

const statusStyles: Record<ProductStatus, string> = {
  Created: "border-sky-200 bg-sky-50 text-sky-700",
  Shipped: "border-amber-200 bg-amber-50 text-amber-700",
  Received: "border-violet-200 bg-violet-50 text-violet-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
