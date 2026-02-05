import Panel from "@/components/permitpilot/ui/Panel";
import { formatCurrency } from "@/lib/permitpilot/currency";

export interface CostItem {
  label: string;
  amount: number;
}

export interface CostBreakdownCardProps {
  items: CostItem[];
  total: number;
  note?: string;
  currencyCode?: string;
  currencyLocale?: string;
}

export default function CostBreakdownCard({
  items = [],
  total = 0,
  note,
  currencyCode,
  currencyLocale,
}: CostBreakdownCardProps) {
  const maxAmount = Math.max(...items.map((item) => item.amount), 1);

  return (
    <Panel
      title="Cost Breakdown"
      eyebrow="Generated"
      description="Projected compliance costs across agencies."
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-500">
                  {formatCurrency(item.amount, currencyCode, currencyLocale)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100/80">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500"
                  style={{ width: `${(item.amount / maxAmount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">Total</span>
          <span className="text-lg font-semibold text-slate-900">
            {formatCurrency(total, currencyCode, currencyLocale)}
          </span>
        </div>
        {note ? <p className="text-xs text-slate-500">{note}</p> : null}
      </div>
    </Panel>
  );
}
