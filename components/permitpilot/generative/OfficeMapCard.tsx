import Panel from "@/components/permitpilot/ui/Panel";

export interface OfficeLocation {
  name: string;
  address: string;
  hours?: string;
}

export interface OfficeMapCardProps {
  city: string;
  offices: OfficeLocation[];
}

export default function OfficeMapCard({
  city = "",
  offices = [],
}: OfficeMapCardProps) {
  return (
    <Panel
      title="Agency Touchpoints"
      eyebrow="Generated"
      description={`Key offices in ${city} that issue approvals.`}
    >
      <div className="space-y-4">
        <div className="relative h-36 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-amber-50">
          <div className="absolute inset-4 rounded-2xl border border-dashed border-slate-200/70" />
          <div className="absolute left-6 top-8 h-2.5 w-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <div className="absolute right-10 top-16 h-2.5 w-2.5 rounded-full bg-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
          <div className="absolute left-20 bottom-6 h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
          <div className="absolute bottom-4 right-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            {city}
          </div>
        </div>
        <div className="space-y-2">
          {offices.map((office) => (
            <div
              key={office.name}
            className="rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-800">{office.name}</p>
              <p className="text-xs text-slate-500">{office.address}</p>
              {office.hours ? (
                <p className="text-xs text-slate-400">{office.hours}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
