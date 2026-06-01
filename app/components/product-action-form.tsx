"use client";

import { Send } from "lucide-react";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { FormEvent, useEffect, useState } from "react";
import { activeChainId, activeNetworkName, appConfig } from "@/lib/config";
import { fetchRole, getErrorMessage } from "@/lib/contracts";
import { getWriteContract } from "@/lib/wallet-contract";
import type { PartnerRole, Product, TxState } from "@/lib/types";
import { TxAlert } from "@/components/tx-alert";

type Action = {
  label: string;
  method: "markAsShipped" | "markAsReceived" | "completeProduct";
  role: PartnerRole;
};

export function ProductActionForm({
  product,
  onDone,
}: {
  product: Product;
  onDone?: () => void;
}) {
  if (!appConfig.hasProjectId) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Set NEXT_PUBLIC_REOWN_PROJECT_ID before using wallet actions.
      </div>
    );
  }

  return <ProductActionControls product={product} onDone={onDone} />;
}

function ProductActionControls({
  product,
  onDone,
}: {
  product: Product;
  onDone?: () => void;
}) {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [role, setRole] = useState<PartnerRole>("Viewer");
  const [tx, setTx] = useState<TxState>({ status: "idle", message: "" });

  useEffect(() => {
    fetchRole(address).then(setRole).catch(() => setRole("Viewer"));
  }, [address]);

  const action = getAction(product);
  const isRightNetwork = Number(chainId) === activeChainId;
  const canSubmit =
    Boolean(action) &&
    isConnected &&
    isRightNetwork &&
    appConfig.hasContract &&
    role === action?.role &&
    tx.status !== "pending";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;
    setTx({ status: "pending", message: "Waiting for wallet confirmation..." });
    try {
      const contract = await getWriteContract(walletProvider);
      const transaction = await contract[action.method](product.id, location, note);
      setTx({
        status: "pending",
        message: `Transaction submitted. Waiting for ${activeNetworkName} confirmation...`,
        hash: transaction.hash,
      });
      await transaction.wait();
      setTx({
        status: "success",
        message: `${action.label} confirmed on ${activeNetworkName}.`,
        hash: transaction.hash,
      });
      setLocation("");
      setNote("");
      onDone?.();
    } catch (error) {
      setTx({ status: "error", message: getErrorMessage(error) });
    }
  }

  if (!action) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        This product is completed and cannot be updated.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <h3 className="text-base font-bold text-slate-950">{action.label}</h3>
        <p className="mt-1 text-sm text-slate-600">
          Requires the connected {action.role} wallet on {activeNetworkName}.
        </p>
      </div>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Location
        <input
          required
          maxLength={120}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Note
        <textarea
          maxLength={500}
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </label>
      <button
        disabled={!canSubmit}
        type="submit"
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Send className="h-4 w-4" />
        {tx.status === "pending" ? "Confirming..." : action.label}
      </button>
      <TxAlert tx={tx} />
    </form>
  );
}

function getAction(product: Product): Action | null {
  if (product.status === "Created") {
    return { label: "Mark as Shipped", method: "markAsShipped", role: "Supplier" };
  }
  if (product.status === "Shipped") {
    return { label: "Confirm Received", method: "markAsReceived", role: "Receiver" };
  }
  if (product.status === "Received") {
    return { label: "Complete Product", method: "completeProduct", role: "Receiver" };
  }
  return null;
}
