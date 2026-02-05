import { z } from "zod/v3";
import {
  useCurrentInteractablesSnapshot,
  useTamboInteractable,
  withInteractable,
} from "@tambo-ai/react";
import { useEffect, useMemo, useState } from "react";
import Panel from "@/components/permitpilot/ui/Panel";
import { resolveCurrency } from "@/lib/permitpilot/currency";

export interface BusinessProfileCardProps {
  businessName: string;
  city: string;
  state: string;
  country: string;
  currencyCode: string;
  businessType: string;
  entityType: string;
  headcount: number;
  budget: number;
  launchWindow: string;
  riskTolerance: "low" | "medium" | "high";
}

function BusinessProfileCard({
  businessName: initialBusinessName,
  city: initialCity,
  state: initialState,
  country: initialCountry,
  currencyCode: initialCurrencyCode,
  businessType: initialBusinessType,
  entityType: initialEntityType,
  headcount: initialHeadcount,
  budget: initialBudget,
  launchWindow: initialLaunchWindow,
  riskTolerance: initialRiskTolerance,
}: BusinessProfileCardProps) {
  const { updateInteractableComponentProps } = useTamboInteractable();
  const interactables = useCurrentInteractablesSnapshot();
  const interactableId = useMemo(
    () => interactables.find((item) => item.name === "BusinessProfile")?.id,
    [interactables]
  );
  const [profile, setProfile] = useState<BusinessProfileCardProps>({
    businessName: initialBusinessName,
    city: initialCity,
    state: initialState,
    country: initialCountry,
    currencyCode: initialCurrencyCode,
    businessType: initialBusinessType,
    entityType: initialEntityType,
    headcount: initialHeadcount,
    budget: initialBudget,
    launchWindow: initialLaunchWindow,
    riskTolerance: initialRiskTolerance,
  });
  const inputClass =
    "rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20";

  useEffect(() => {
    setProfile({
      businessName: initialBusinessName,
      city: initialCity,
      state: initialState,
      country: initialCountry,
      currencyCode: initialCurrencyCode,
      businessType: initialBusinessType,
      entityType: initialEntityType,
      headcount: initialHeadcount,
      budget: initialBudget,
      launchWindow: initialLaunchWindow,
      riskTolerance: initialRiskTolerance,
    });
  }, [
    initialBusinessName,
    initialCity,
    initialState,
    initialCountry,
    initialCurrencyCode,
    initialBusinessType,
    initialEntityType,
    initialHeadcount,
    initialBudget,
    initialLaunchWindow,
    initialRiskTolerance,
  ]);

  const updateProfile = <K extends keyof BusinessProfileCardProps>(
    key: K,
    value: BusinessProfileCardProps[K]
  ) => {
    setProfile((prev) => {
      const next = { ...prev, [key]: value };
      const updates: Partial<BusinessProfileCardProps> = { [key]: value };

      if (
        (key === "country" || key === "state" || key === "city") &&
        prev.currencyCode.toUpperCase() === "USD"
      ) {
        const currency = resolveCurrency({
          country: next.country,
          state: next.state,
          city: next.city,
        });
        next.currencyCode = currency.code;
        updates.currencyCode = currency.code;
      }

      if (interactableId) {
        updateInteractableComponentProps(interactableId, updates);
      }

      return next;
    });
  };

  return (
    <Panel
      title="Business Profile"
      eyebrow="Interactable"
      description="Live inputs the agent can update and read."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Business Name
          <input
            className={inputClass}
            value={profile.businessName}
            onChange={(event) => updateProfile("businessName", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Business Type
          <input
            className={inputClass}
            value={profile.businessType}
            onChange={(event) => updateProfile("businessType", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          City
          <input
            className={inputClass}
            value={profile.city}
            onChange={(event) => updateProfile("city", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Country
          <input
            className={inputClass}
            value={profile.country}
            onChange={(event) => updateProfile("country", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          State
          <input
            className={inputClass}
            value={profile.state}
            onChange={(event) => updateProfile("state", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Currency
          <input
            className={inputClass}
            value={profile.currencyCode}
            onChange={(event) =>
              updateProfile("currencyCode", event.target.value.toUpperCase())
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Entity Type
          <input
            className={inputClass}
            value={profile.entityType}
            onChange={(event) => updateProfile("entityType", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Launch Window
          <input
            className={inputClass}
            value={profile.launchWindow}
            onChange={(event) => updateProfile("launchWindow", event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Headcount
          <input
            type="number"
            min={0}
            className={inputClass}
            value={profile.headcount}
            onChange={(event) =>
              updateProfile("headcount", Number(event.target.value) || 0)
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          <span>
            Budget ({profile.currencyCode ? profile.currencyCode : "Local"})
          </span>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={profile.budget}
            onChange={(event) =>
              updateProfile("budget", Number(event.target.value) || 0)
            }
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Risk Tolerance
          <select
            className={inputClass}
            value={profile.riskTolerance}
            onChange={(event) =>
              updateProfile(
                "riskTolerance",
                event.target.value as "low" | "medium" | "high"
              )
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>
    </Panel>
  );
}

const businessProfileSchema = z.object({
  businessName: z.string().describe("Public-facing business name"),
  city: z.string().describe("City where the business operates"),
  state: z.string().describe("State or region code"),
  country: z.string().describe("Country where the business operates"),
  currencyCode: z.string().describe("Currency code, e.g. USD or INR"),
  businessType: z.string().describe("Type of business, e.g. food truck"),
  entityType: z.string().describe("Entity type such as LLC or sole proprietor"),
  headcount: z.number().describe("Planned number of employees"),
  budget: z.number().describe("Compliance budget in local currency"),
  launchWindow: z.string().describe("Target launch timing or deadline"),
  riskTolerance: z
    .enum(["low", "medium", "high"])
    .describe("How conservative the plan should be"),
});

const InteractableBusinessProfileCard = withInteractable(BusinessProfileCard, {
  componentName: "BusinessProfile",
  description:
    "Persistent profile of the business with editable fields the agent can update.",
  propsSchema: businessProfileSchema,
});

export default InteractableBusinessProfileCard;
