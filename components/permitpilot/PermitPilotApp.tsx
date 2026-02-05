import ChatPanel from "@/components/permitpilot/ChatPanel";
import BusinessProfileCard from "@/components/permitpilot/interactables/BusinessProfileCard";
import PermitChecklist from "@/components/permitpilot/interactables/PermitChecklist";
import TimelineBoard from "@/components/permitpilot/interactables/TimelineBoard";
import ActionBoard from "@/components/permitpilot/interactables/ActionBoard";
import ToolResultPanels from "@/components/permitpilot/ToolResultPanels";
import { TamboProvider } from "@tambo-ai/react";
import { permitPilotComponents } from "@/lib/permitpilot/tamboComponents";
import { permitPilotTools } from "@/lib/permitpilot/tools";
import { permitPilotInitialMessages } from "@/lib/permitpilot/initialMessages";

const initialProfile = {
  businessName: "Lone Star Bites",
  city: "Austin",
  state: "TX",
  country: "USA",
  currencyCode: "USD",
  businessType: "Food Truck",
  entityType: "LLC",
  headcount: 2,
  budget: 5000,
  launchWindow: "45 days",
  riskTolerance: "medium" as const,
};

const initialChecklist = [
  {
    id: "ATX-FT-01",
    title: "Mobile Food Vendor Permit",
    agency: "Austin Public Health",
    dueDate: "Feb 18",
    cost: 375,
    status: "in_progress" as const,
  },
  {
    id: "ATX-FT-02",
    title: "Fire Inspection Certificate",
    agency: "Austin Fire Department",
    dueDate: "Feb 22",
    cost: 160,
    status: "todo" as const,
  },
  {
    id: "ATX-FT-03",
    title: "Commissary Agreement",
    agency: "Travis County",
    dueDate: "Feb 14",
    cost: 0,
    status: "done" as const,
  },
];

const initialTimeline = [
  {
    id: "M1",
    title: "Submit mobile vendor application",
    targetDate: "Feb 18",
    owner: "Founder",
    status: "active" as const,
  },
  {
    id: "M2",
    title: "Complete fire inspection",
    targetDate: "Feb 25",
    owner: "AFD",
    status: "planned" as const,
  },
  {
    id: "M3",
    title: "Health inspection + license issuance",
    targetDate: "Mar 5",
    owner: "APH",
    status: "waiting" as const,
  },
];

const initialActions = [
  {
    id: "A1",
    task: "Upload commissary letter + menu",
    owner: "Founder",
    priority: "high" as const,
    eta: "Tomorrow",
  },
  {
    id: "A2",
    task: "Book fire inspection slot",
    owner: "Operations",
    priority: "medium" as const,
    eta: "This week",
  },
  {
    id: "A3",
    task: "Confirm insurance coverage",
    owner: "Legal",
    priority: "low" as const,
    eta: "Next week",
  },
];

export default function PermitPilotApp() {
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_TAMBO_API_KEY);

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY ?? ""}
      components={permitPilotComponents}
      tools={permitPilotTools}
      initialMessages={permitPilotInitialMessages}
    >
      <div className="relative min-h-screen overflow-hidden bg-[#f5f0e8] text-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,_rgba(56,189,248,0.22),_transparent_48%),radial-gradient(circle_at_80%_10%,_rgba(16,185,129,0.2),_transparent_45%),radial-gradient(circle_at_70%_80%,_rgba(251,191,36,0.18),_transparent_50%)]" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-900/10 via-slate-900/0 to-transparent blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                  PermitPilot
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Adaptive Permits & Launch Planner
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
                  UI Strikes Back
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.18)]">
                  Live Mission
                </span>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.1)] backdrop-blur">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Describe a business idea, and the AI assembles the exact permit
                  journey. The UI adapts in real time as the plan changes — from
                  cost breakdowns to agency timelines and required documents.
                </p>
              </div>
              <div className="rounded-3xl border border-slate-900/90 bg-slate-900/95 p-6 text-slate-50 shadow-[0_18px_45px_rgba(15,23,42,0.28)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Demo Goal
                </p>
                <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                  Show the AI shifting requirements when the business model,
                  budget, or deadline changes. Highlight persistent panels on the
                  left that update in place.
                </p>
              </div>
            </div>
            <ChatPanel />
            {!hasApiKey ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
                Add <strong>NEXT_PUBLIC_TAMBO_API_KEY</strong> to{" "}
                <code>.env.local</code> to enable live agent responses.
              </div>
            ) : null}
          </header>

          <main className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <BusinessProfileCard {...initialProfile} />
              <PermitChecklist
                items={initialChecklist}
                currencyCode={initialProfile.currencyCode}
              />
              <TimelineBoard milestones={initialTimeline} />
              <ActionBoard actions={initialActions} />
            </div>
            <div className="flex flex-col gap-6">
              <ToolResultPanels />
            </div>
          </main>
        </div>
      </div>
    </TamboProvider>
  );
}
