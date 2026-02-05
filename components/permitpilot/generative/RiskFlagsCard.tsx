import Panel from "@/components/permitpilot/ui/Panel";

export interface RiskFlag {
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface RiskFlagsCardProps {
  flags: RiskFlag[];
}

const severityStyles: Record<RiskFlag["severity"], string> = {
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function RiskFlagsCard({ flags = [] }: RiskFlagsCardProps) {
  return (
    <Panel
      title="Risk & Compliance Flags"
      eyebrow="Generated"
      description="Areas that could slow down approval or add cost."
    >
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.title}
            className={`rounded-2xl border px-4 py-3 ${severityStyles[flag.severity]}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{flag.title}</p>
              <span className="text-[11px] uppercase tracking-[0.2em]">
                {flag.severity}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600">{flag.description}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
