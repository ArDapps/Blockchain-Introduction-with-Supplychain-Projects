"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { appConfig } from "@/lib/config";
import { fetchProduct, formatAddress, formatDate } from "@/lib/contracts";
import type { HistoryEntry, Product } from "@/lib/types";
import { ProductActionForm } from "@/components/product-action-form";
import { ProductTimeline } from "@/components/product-timeline";
import { StatusBadge } from "@/components/status-badge";

export function ProductDetails({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = useCallback(async () => {
    if (!appConfig.hasContract) {
      setError("Set NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS to read products.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await fetchProduct(productId);
      setProduct(result.product);
      setHistory(result.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product not found.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProduct();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProduct]);

  if (loading) return <p className="text-sm text-slate-600">Loading product...</p>;
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Product #{product.id}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">{product.name}</h1>
            </div>
            <StatusBadge status={product.status} />
          </div>
          <p className="mt-4 max-w-3xl text-slate-600">
            {product.description || "No description provided."}
          </p>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-900">Origin</dt>
              <dd className="mt-1 text-slate-600">{product.origin}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Created</dt>
              <dd className="mt-1 text-slate-600">{formatDate(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-900">Created By</dt>
              <dd className="mt-1 font-mono text-xs text-slate-600">
                {formatAddress(product.createdBy)}
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Immutable Timeline</h2>
            <button
              type="button"
              onClick={loadProduct}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          <ProductTimeline history={history} />
        </div>
      </section>
      <aside className="space-y-4">
        <ProductActionForm product={product} onDone={loadProduct} />
      </aside>
    </div>
  );
}
