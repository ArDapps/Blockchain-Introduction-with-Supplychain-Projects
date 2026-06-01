import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatAddress, formatDate } from "@/lib/contracts";
import type { Product } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Product #{product.id}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{product.name}</h3>
        </div>
        <StatusBadge status={product.status} />
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
        {product.description || "No description provided."}
      </p>
      <dl className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex justify-between gap-4">
          <dt>Origin</dt>
          <dd className="font-medium text-slate-900">{product.origin}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Created</dt>
          <dd className="font-medium text-slate-900">{formatDate(product.createdAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Supplier</dt>
          <dd className="font-mono text-xs font-medium text-slate-900">
            {formatAddress(product.createdBy)}
          </dd>
        </div>
      </dl>
      <Link
        href={`/products/${product.id}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        Open product <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
