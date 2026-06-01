"use client";

import { LogOut, PlugZap, RefreshCw } from "lucide-react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { activeChainId, activeNetworkName, appConfig } from "@/lib/config";
import { activeAppKitNetwork } from "@/context/appkit";
import { fetchRole, formatAddress } from "@/lib/contracts";
import type { PartnerRole } from "@/lib/types";

export function WalletBar() {
  if (!appConfig.hasProjectId) {
    return (
      <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
        Missing Reown project ID
      </span>
    );
  }

  return <WalletControls />;
}

function WalletControls() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const [role, setRole] = useState<PartnerRole>("Viewer");

  const isRightNetwork = Number(chainId) === activeChainId;

  useEffect(() => {
    let active = true;
    fetchRole(address)
      .then((nextRole) => active && setRole(nextRole))
      .catch(() => active && setRole("Viewer"));
    return () => {
      active = false;
    };
  }, [address]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
        {isConnected ? role : "Viewer"} ·{" "}
        {isRightNetwork ? activeNetworkName : "Wrong network"}
      </span>
      {isConnected ? (
        <>
          {!isRightNetwork ? (
            <button
              type="button"
              onClick={() => switchNetwork(activeAppKitNetwork)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-3 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              <RefreshCw className="h-4 w-4" />
              {activeNetworkName}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => open({ view: "Account" })}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            {formatAddress(address)}
          </button>
          <button
            type="button"
            onClick={() => disconnect()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            aria-label="Disconnect wallet"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => open()}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <PlugZap className="h-4 w-4" />
          Connect Wallet
        </button>
      )}
    </div>
  );
}
