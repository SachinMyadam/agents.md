import { z } from "zod/v3";
import { withInteractable } from "@tambo-ai/react";
import Panel from "@/components/permitpilot/ui/Panel";

export interface TimelineMilestone {
  id: string;
  title: string;
  targetDate: string;
  owner: string;
  status: "planned" | "active" | "waiting" | "done";
}

export interface TimelineBoardProps {
  milestones: TimelineMilestone[];
}

const statusTone: Record<TimelineMilestone["status"], string> = {
  planned: "bg-slate-100 text-slate-600",
  active: "bg-cyan-100 text-cyan-700",
  waiting: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

function TimelineBoard({ milestones: initialMilestones }: TimelineBoardProps) {
  const milestones = initialMilestones;

  return (
    <Panel
      title="Launch Timeline"
      eyebrow="Interactable"
      description="Milestones the agent can update as plans shift."
    >
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
              {index < milestones.length - 1 ? (
                <div className="mt-2 h-full w-px bg-slate-200/70" />
              ) : null}
            </div>
            <div className="flex-1 rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {milestone.title}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                    statusTone[milestone.status]
                  }`}
                >
                  {milestone.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Target {milestone.targetDate} · Owner {milestone.owner}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const timelineSchema = z.object({
  milestones: z
    .array(
      z.object({
        id: z.string().describe("Stable identifier"),
        title: z.string().describe("Milestone name"),
        targetDate: z.string().describe("Target completion date"),
        owner: z.string().describe("Owner or agency"),
        status: z
          .enum(["planned", "active", "waiting", "done"])
          .describe("Progress status"),
      })
    )
    .describe("Ordered milestones for launch timeline"),
});

const InteractableTimelineBoard = withInteractable(TimelineBoard, {
  componentName: "LaunchTimeline",
  description:
    "Persistent timeline board that keeps launch milestones visible and updateable.",
  propsSchema: timelineSchema,
});

export default InteractableTimelineBoard;
