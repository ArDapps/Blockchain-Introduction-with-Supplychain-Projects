import { ProductList } from "@/components/product-list";
import { ProductSearch } from "@/components/product-search";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1fr_360px] md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Product registry
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Products</h1>
          <p className="mt-2 text-slate-600">
            Browse current on-chain products or jump directly to a product ID.
          </p>
        </div>
        <ProductSearch />
      </section>
      <ProductList />
    </div>
  );
}
