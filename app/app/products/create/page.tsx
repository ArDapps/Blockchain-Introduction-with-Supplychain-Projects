import { CreateProductForm } from "@/components/create-product-form";

export default function CreateProductPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Supplier action
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Create Product</h1>
        <p className="mt-2 text-slate-600">
          Only the Supplier wallet can create products. Each creation records the
          first immutable timeline entry.
        </p>
      </section>
      <CreateProductForm />
    </div>
  );
}
