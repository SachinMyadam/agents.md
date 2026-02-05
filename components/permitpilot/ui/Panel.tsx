import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  tone?: "neutral" | "accent" | "glass";
  footer?: ReactNode;
}

const toneStyles: Record<NonNullable<PanelProps["tone"]>, string> = {
  neutral:
    "bg-white/75 border-white/70 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur",
  accent:
    "bg-slate-900/95 text-slate-50 border-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.25)]",
  glass:
    "bg-white/65 border-white/60 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur",
};

export default function Panel({
  title,
  eyebrow,
  description,
  children,
  tone = "neutral",
  footer,
}: PanelProps) {
  const normalizedEyebrow = eyebrow?.toLowerCase() ?? "";
  const eyebrowClass =
    tone === "accent"
      ? "text-slate-300"
      : normalizedEyebrow === "generated"
      ? "text-emerald-700"
      : normalizedEyebrow === "interactable"
      ? "text-sky-700"
      : normalizedEyebrow === "awaiting"
      ? "text-amber-700"
      : "text-slate-400";
  const titleClass = tone === "accent" ? "text-slate-50" : "text-slate-900";
  const descriptionClass =
    tone === "accent" ? "text-slate-300" : "text-slate-500";
  const accentBarClass =
    tone === "accent"
      ? "from-slate-500 via-slate-300 to-slate-500"
      : "from-sky-300 via-emerald-300 to-amber-300";

  return (
    <section
      className={`rounded-3xl border px-5 py-4 sm:px-6 ${toneStyles[tone]}`}
    >
      <div className="flex flex-col gap-1">
        {eyebrow ? (
          <span
            className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${eyebrowClass}`}
          >
            {eyebrow}
          </span>
        ) : null}
        <div className={`h-1 w-14 rounded-full bg-gradient-to-r ${accentBarClass}`} />
        <h3 className={`text-lg font-semibold tracking-tight ${titleClass}`}>
          {title}
        </h3>
        {description ? (
          <p className={`text-sm ${descriptionClass}`}>{description}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </section>
  );
}
