"use client";

import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { appConfig } from "@/lib/config";
import { fetchRole } from "@/lib/contracts";
import type { PartnerRole } from "@/lib/types";
import { ProductList } from "@/components/product-list";
import { ProductSearch } from "@/components/product-search";

export function DashboardView() {
  if (!appConfig.hasProjectId) {
    return (
      <div className="space-y-8">
        <section className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Set NEXT_PUBLIC_REOWN_PROJECT_ID to enable connected wallet roles.
        </section>
        <ProductSearch />
        <ProductList />
      </div>
    );
  }

  return <ConnectedDashboard />;
}

function ConnectedDashboard() {
  const { address, isConnected } = useAppKitAccount();
  const [role, setRole] = useState<PartnerRole>("Viewer");

  useEffect(() => {
    fetchRole(address).then(setRole).catch(() => setRole("Viewer"));
  }, [address]);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Connected dashboard
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">
              {isConnected ? `${role} workspace` : "Connect to manage products"}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Supplier wallets can create and ship. Receiver wallets can confirm
              receipt and complete. Viewers stay read-only.
            </p>
          </div>
          {role === "Supplier" ? (
            <Link
              href="/products/create"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              Create Product
            </Link>
          ) : null}
        </div>
      </section>
      {role === "Viewer" ? (
        <section className="grid gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5 md:grid-cols-[1fr_360px]">
          <p className="text-sm text-amber-800">
            This wallet is not one of the two authorized partners. You can still
            search and inspect every product timeline.
          </p>
          <ProductSearch />
        </section>
      ) : null}
      <ProductList />
    </div>
  );
}
