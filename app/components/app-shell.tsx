import Link from "next/link";
import { ArrowUpRight, Link2, PackageCheck } from "lucide-react";
import { WalletBar } from "@/components/wallet-bar";
import { activeNetworkName } from "@/lib/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Registry" },
  { href: "/products/create", label: "Create" },
  { href: "/dashboard", label: "Dashboard" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:h-20 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:py-0">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
                <PackageCheck className="h-5 w-5" />
                <Link2 className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-500 p-0.5 text-white ring-2 ring-white" />
              </span>
              <span className="leading-tight">
                <span className="block text-xl font-black text-slate-950">
                  ChainLedger
                </span>
                <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Verified Supply Chain
                </span>
              </span>
            </Link>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 lg:hidden">
              {activeNetworkName}
            </span>
          </div>

          <nav className="flex w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-100/80 p-1 lg:w-auto lg:overflow-visible">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-md px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-white hover:text-slate-950 hover:shadow-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
            <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 lg:inline-flex">
              {activeNetworkName}
            </span>
            <Link
              href="/dashboard"
              className="hidden h-10 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-sm font-bold text-white transition hover:bg-slate-800 lg:inline-flex"
            >
              Open App <ArrowUpRight className="h-4 w-4" />
            </Link>
            <WalletBar />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
