import { z } from "zod/v3";
import { withInteractable } from "@tambo-ai/react";
import Panel from "@/components/permitpilot/ui/Panel";

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  priority: "low" | "medium" | "high";
  eta: string;
}

export interface ActionBoardProps {
  actions: ActionItem[];
}

const priorityStyles: Record<ActionItem["priority"], string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-rose-50 text-rose-700",
};

function ActionBoard({ actions: initialActions }: ActionBoardProps) {
  const actions = initialActions;

  return (
    <Panel
      title="Next Actions"
      eyebrow="Interactable"
      description="Top tasks the agent keeps fresh as context changes."
    >
      <div className="space-y-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {action.task}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  priorityStyles[action.priority]
                }`}
              >
                {action.priority}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Owner {action.owner} · ETA {action.eta}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const actionBoardSchema = z.object({
  actions: z
    .array(
      z.object({
        id: z.string().describe("Stable identifier"),
        task: z.string().describe("Action item"),
        owner: z.string().describe("Responsible owner"),
        priority: z
          .enum(["low", "medium", "high"])
          .describe("Priority level"),
        eta: z.string().describe("Expected completion date"),
      })
    )
    .describe("Ordered list of next actions"),
});

const InteractableActionBoard = withInteractable(ActionBoard, {
  componentName: "NextActions",
  description:
    "Persistent action list showing the next tasks required for launch.",
  propsSchema: actionBoardSchema,
});

export default InteractableActionBoard;
