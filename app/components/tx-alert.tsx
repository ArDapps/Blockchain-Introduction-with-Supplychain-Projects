import { ExternalLink } from "lucide-react";
import { explorerTxUrl } from "@/lib/config";
import type { TxState } from "@/lib/types";

export function TxAlert({ tx }: { tx: TxState }) {
  if (tx.status === "idle") return null;
  const txUrl = tx.hash ? explorerTxUrl(tx.hash) : "";

  const color =
    tx.status === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : tx.status === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-lg border p-3 text-sm ${color}`}>
      <p>{tx.message}</p>
      {txUrl ? (
        <a
          className="mt-2 inline-flex items-center gap-1 font-semibold underline"
          href={txUrl}
          target="_blank"
          rel="noreferrer"
        >
          View transaction <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </div>
  );
}
