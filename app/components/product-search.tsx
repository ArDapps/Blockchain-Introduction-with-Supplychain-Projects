"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function ProductSearch() {
  const router = useRouter();
  const [productId, setProductId] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = productId.trim();
    if (id) router.push(`/products/${id}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <label className="sr-only" htmlFor="product-id">
        Product ID
      </label>
      <input
        id="product-id"
        min="1"
        type="number"
        value={productId}
        onChange={(event) => setProductId(event.target.value)}
        placeholder="Search product ID"
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 transition focus:ring-2"
      />
      <button
        type="submit"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white transition hover:bg-slate-800"
        aria-label="Search product"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
