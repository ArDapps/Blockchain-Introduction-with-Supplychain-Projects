"use client";

import { PlusCircle } from "lucide-react";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { FormEvent, useEffect, useState } from "react";
import { activeChainId, activeNetworkName, appConfig } from "@/lib/config";
import { fetchRole, getErrorMessage } from "@/lib/contracts";
import { getWriteContract } from "@/lib/wallet-contract";
import type { PartnerRole, TxState } from "@/lib/types";
import { TxAlert } from "@/components/tx-alert";

const initialForm = { name: "", description: "", origin: "", location: "", note: "" };

export function CreateProductForm() {
  if (!appConfig.hasProjectId) {
    return <MissingWalletConfig />;
  }

  return <CreateProductControls />;
}

function CreateProductControls() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  const [role, setRole] = useState<PartnerRole>("Viewer");
  const [form, setForm] = useState(initialForm);
  const [tx, setTx] = useState<TxState>({ status: "idle", message: "" });

  useEffect(() => {
    fetchRole(address).then(setRole).catch(() => setRole("Viewer"));
  }, [address]);

  const canSubmit =
    isConnected &&
    role === "Supplier" &&
    Number(chainId) === activeChainId &&
    appConfig.hasContract &&
    tx.status !== "pending";

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTx({ status: "pending", message: "Waiting for wallet confirmation..." });
    try {
      const contract = await getWriteContract(walletProvider);
      const transaction = await contract.createProduct(
        form.name,
        form.description,
        form.origin,
        form.location,
        form.note,
      );
      setTx({
        status: "pending",
        message: `Product creation submitted. Waiting for ${activeNetworkName} confirmation...`,
        hash: transaction.hash,
      });
      await transaction.wait();
      setTx({
        status: "success",
        message: `Product created on ${activeNetworkName}.`,
        hash: transaction.hash,
      });
      setForm(initialForm);
    } catch (error) {
      setTx({ status: "error", message: getErrorMessage(error) });
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {[
        ["name", "Product name", 100, "Organic cotton batch #A-102"],
        ["origin", "Origin", 120, "Alexandria warehouse"],
        ["location", "Initial location", 120, "Supplier loading dock"],
      ].map(([field, label, max, placeholder]) => (
        <label key={field} className="grid gap-1 text-sm font-medium text-slate-700">
          {label}
          <input
            required
            maxLength={Number(max)}
            placeholder={String(placeholder)}
            value={form[field as keyof typeof form]}
            onChange={(event) => updateField(field as keyof typeof form, event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>
      ))}
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Description
        <textarea
          maxLength={500}
          rows={4}
          placeholder="Add product details, batch notes, or handling requirements."
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </label>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Note
        <textarea
          maxLength={500}
          rows={3}
          placeholder="Initial condition, custody note, or inspection comment."
          value={form.note}
          onChange={(event) => updateField("note", event.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </label>
      <button
        disabled={!canSubmit}
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <PlusCircle className="h-4 w-4" />
        {tx.status === "pending" ? "Creating..." : "Create Product"}
      </button>
      <TxAlert tx={tx} />
    </form>
  );
}

function MissingWalletConfig() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      Set NEXT_PUBLIC_REOWN_PROJECT_ID before using wallet actions.
    </div>
  );
}
