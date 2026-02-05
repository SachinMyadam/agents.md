import { z } from "zod/v3";
import {
  useCurrentInteractablesSnapshot,
  useTamboInteractable,
  withInteractable,
} from "@tambo-ai/react";
import { useEffect, useMemo, useState } from "react";
import Panel from "@/components/permitpilot/ui/Panel";
import { formatCurrency, resolveCurrency } from "@/lib/permitpilot/currency";

export interface PermitChecklistItem {
  id: string;
  title: string;
  agency: string;
  dueDate: string;
  cost: number;
  status: "todo" | "in_progress" | "blocked" | "done";
}

export interface PermitChecklistProps {
  items: PermitChecklistItem[];
  currencyCode?: string;
  currencyLocale?: string;
}

const statusStyles: Record<PermitChecklistItem["status"], string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-sky-100 text-sky-700",
  blocked: "bg-rose-100 text-rose-700",
  done: "bg-emerald-100 text-emerald-700",
};

function PermitChecklist({
  items: initialItems,
  currencyCode,
  currencyLocale,
}: PermitChecklistProps) {
  const { updateInteractableComponentProps } = useTamboInteractable();
  const interactables = useCurrentInteractablesSnapshot();
  const profileSnapshot = useMemo(
    () =>
      (interactables.find((item) => item.name === "BusinessProfile")?.props as {
        currencyCode?: string;
        country?: string;
        state?: string;
        city?: string;
      } | undefined) ?? {},
    [interactables]
  );
  const resolvedCurrency = resolveCurrency({
    country: profileSnapshot.country,
    state: profileSnapshot.state,
    city: profileSnapshot.city,
  });
  const effectiveCurrencyCode =
    currencyCode ?? profileSnapshot.currencyCode ?? resolvedCurrency.code;
  const effectiveCurrencyLocale = currencyLocale ?? resolvedCurrency.locale;
  const interactableId = useMemo(
    () => interactables.find((item) => item.name === "PermitChecklist")?.id,
    [interactables]
  );
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const toggleDone = (id: string) => {
    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            status: item.status === "done" ? "todo" : "done",
          }
        : item
    );
    setItems(updated);
    if (interactableId) {
      updateInteractableComponentProps(interactableId, { items: updated });
    }
  };

  return (
    <Panel
      title="Permit Checklist"
      eyebrow="Interactable"
      description="Track each permit as approvals progress."
    >
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500">
                  {item.agency} · Due {item.dueDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleDone(item.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  statusStyles[item.status]
                }`}
              >
                {item.status.replace("_", " ")}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                Est.{" "}
                {formatCurrency(
                  item.cost,
                  effectiveCurrencyCode,
                  effectiveCurrencyLocale
                )}
              </span>
              <span>ID {item.id}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

const permitChecklistSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().describe("Stable identifier"),
        title: z.string().describe("Permit or approval name"),
        agency: z.string().describe("Issuing agency"),
        dueDate: z.string().describe("Target submission date"),
        cost: z.number().describe("Estimated cost in local currency"),
        status: z
          .enum(["todo", "in_progress", "blocked", "done"])
          .describe("Current permit status"),
      })
    )
    .describe("Ordered list of permits and approvals"),
  currencyCode: z.string().optional().describe("Currency code for cost display"),
  currencyLocale: z.string().optional().describe("Locale for currency format"),
});

const InteractablePermitChecklist = withInteractable(PermitChecklist, {
  componentName: "PermitChecklist",
  description:
    "Persistent checklist the agent can update as permit statuses change.",
  propsSchema: permitChecklistSchema,
});

export default InteractablePermitChecklist;
