import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Link2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductSearch } from "@/components/product-search";
import { activeNetworkName } from "@/lib/config";

const workflow = ["Created", "Shipped", "Received", "Completed"];

const proofPoints = [
  ["Two wallets", "Supplier and Receiver permissions are enforced on-chain."],
  ["One lifecycle", "Every product moves forward through four fixed stages."],
  ["Full audit", "Each update appends a permanent location, note, and actor."],
];

const audience = [
  ["Supplier", "Create a product and ship it when it leaves your custody.", Truck],
  ["Receiver", "Confirm arrival, then complete the supply-chain record.", PackageCheck],
  ["Viewer", "Search by product ID and inspect the immutable timeline.", ShieldCheck],
];

export default function Home() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
        <div className="flex min-h-[520px] flex-col justify-between rounded-lg bg-slate-950 p-5 text-white shadow-sm sm:p-8 lg:p-10">
          <div>
            <div className="inline-flex max-w-full items-center gap-3 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-100">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-slate-950">
                <Link2 className="h-4 w-4" />
              </span>
              <span className="truncate">ChainLedger on {activeNetworkName}</span>
            </div>
            <h1 className="mt-7 max-w-2xl text-4xl font-black tracking-normal text-white sm:text-5xl lg:text-6xl">
              Verifiable handoffs for two-partner supply chains.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              ChainLedger gives suppliers and receivers a simple blockchain
              record for every product: create, ship, receive, complete, and
              prove the path without adding operational clutter.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                Launch DApp <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                View Registry
              </Link>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {workflow.map((step, index) => (
              <div
                key={step}
                className="rounded-lg border border-white/10 bg-white/[0.06] p-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  0{index + 1}
                </span>
                <p className="mt-1 font-bold text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-slate-900 shadow-sm sm:min-h-[420px] lg:min-h-full">
            <Image
              src="/brand/chainledger-hero.png"
              alt="Modern supply-chain control room with verified shipment path"
              fill
              priority
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0)_35%,rgba(15,23,42,0.78)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <div className="max-w-md rounded-lg border border-white/15 bg-white/12 p-4 text-white backdrop-blur-md">
                <p className="text-sm font-bold text-emerald-200">
                  Immutable product timeline
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  Every status update records the wallet, location, note, and
                  timestamp directly from the contract.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {proofPoints.map(([title, body]) => (
          <article
            key={title}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <h2 className="mt-4 text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start lg:p-8">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Product lookup
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Public proof without a public mess.
          </h2>
          <p className="mt-3 text-slate-600">
            Buyers, auditors, and partners can search by product ID and see the
            exact timeline. Write actions stay locked to the Supplier and
            Receiver wallets.
          </p>
          <div className="mt-6">
            <ProductSearch />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {audience.map(([title, body, Icon]) => (
            <article
              key={String(title)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-5"
            >
              <Icon className="h-5 w-5 text-emerald-700" />
              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {String(title)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {String(body)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Ready for local demos and Sepolia pilots
            </p>
            <h2 className="mt-2 text-3xl font-bold">Start with a real product.</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Use the dashboard for role-aware actions, or browse the registry
              to inspect product status and timeline history.
            </p>
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/products/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Create Product <Boxes className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Dashboard <Clock3 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
