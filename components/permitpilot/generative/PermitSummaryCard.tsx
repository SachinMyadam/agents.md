import Panel from "@/components/permitpilot/ui/Panel";
import { formatCurrency } from "@/lib/permitpilot/currency";

export interface PermitSummaryCardProps {
  summary: string;
  keyPermits: string[];
  agencies: string[];
  timelineDays: number;
  estimatedCost: number;
  currencyCode?: string;
  currencyLocale?: string;
}

export default function PermitSummaryCard({
  summary,
  keyPermits = [],
  agencies = [],
  timelineDays = 0,
  estimatedCost = 0,
  currencyCode,
  currencyLocale,
}: PermitSummaryCardProps) {
  const timelineLabel = Number.isFinite(timelineDays)
    ? `${timelineDays} days`
    : "—";
  const costLabel = Number.isFinite(estimatedCost)
    ? formatCurrency(estimatedCost, currencyCode, currencyLocale)
    : "—";

  return (
    <Panel
      title="Permit Mission Brief"
      eyebrow="Generated"
      description="Snapshot of the compliance landscape."
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{summary}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Timeline
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {timelineLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Estimated Cost
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {costLabel}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Key Permits
            </p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {keyPermits.map((permit) => (
                <li key={permit} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                  <span>{permit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Agencies Involved
            </p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {agencies.map((agency) => (
                <li key={agency} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-500/80" />
                  <span>{agency}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
}
