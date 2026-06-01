"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { appConfig } from "@/lib/config";
import { fetchProducts } from "@/lib/contracts";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

export function ProductList({ limit = 50 }: { limit?: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!appConfig.hasContract) {
      setLoading(false);
      setError("Set NEXT_PUBLIC_SUPPLY_CHAIN_CONTRACT_ADDRESS to read products.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setProducts(await fetchProducts(limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  if (loading) return <p className="text-sm text-slate-600">Loading products...</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{products.length} products found</p>
        <button
          type="button"
          onClick={loadProducts}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {!error && products.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No products have been created yet.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
