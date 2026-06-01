import { CheckCircle2 } from "lucide-react";
import { formatAddress, formatDate } from "@/lib/contracts";
import type { HistoryEntry } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

export function ProductTimeline({ history }: { history: HistoryEntry[] }) {
  return (
    <ol className="space-y-4">
      {history.map((entry, index) => (
        <li key={`${entry.timestamp}-${index}`} className="flex gap-3">
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={entry.status} />
              <time className="text-xs font-medium text-slate-500">
                {formatDate(entry.timestamp)}
              </time>
            </div>
            <p className="mt-3 text-sm text-slate-700">{entry.note || "No note."}</p>
            <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-900">Location</dt>
                <dd>{entry.location}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">Actor</dt>
                <dd className="font-mono text-xs">{formatAddress(entry.actor)}</dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
}
