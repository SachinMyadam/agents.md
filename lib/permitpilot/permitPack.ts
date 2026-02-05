import { findPermitTemplate } from "@/lib/permitpilot/data";
import { convertFromUsd, resolveCurrency } from "@/lib/permitpilot/currency";

export type PermitChecklistStatus = "todo" | "in_progress" | "blocked" | "done";
export type TimelineStatus = "planned" | "active" | "waiting" | "done";
export type ActionPriority = "low" | "medium" | "high";
export type RiskSeverity = "low" | "medium" | "high";

export interface PermitProfile {
  businessName?: string;
  city?: string;
  state?: string;
  country?: string;
  currencyCode?: string;
  businessType?: string;
  entityType?: string;
  headcount?: number;
  budget?: number;
  launchWindow?: string;
  riskTolerance?: "low" | "medium" | "high";
}

export interface PermitPack {
  city?: string;
  state?: string;
  country?: string;
  businessType?: string;
  currencyCode?: string;
  currencyLocale?: string;
  profile?: PermitProfile;
  summary: string;
  keyPermits: string[];
  agencies: string[];
  timelineDays: number;
  estimatedCost: number;
  permitChecklist: Array<{
    id: string;
    title: string;
    agency: string;
    dueDate: string;
    cost: number;
    status: PermitChecklistStatus;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    targetDate: string;
    owner: string;
    status: TimelineStatus;
  }>;
  actions: Array<{
    id: string;
    task: string;
    owner: string;
    priority: ActionPriority;
    eta: string;
  }>;
  costItems: Array<{ label: string; amount: number }>;
  risks: Array<{ title: string; severity: RiskSeverity; description: string }>;
  documents: Array<{ name: string; required: boolean; notes?: string }>;
  offices: Array<{ name: string; address: string; hours?: string }>;
}

export function buildPermitPackFromProfile(
  profile?: PermitProfile
): PermitPack | null {
  if (!profile?.city || !profile.businessType) {
    return null;
  }
  const budget = profile.budget ?? 0;
  const riskTolerance = profile.riskTolerance ?? "medium";
  const state = profile.state ?? profile.country ?? "Region";
  const locationCurrency = resolveCurrency({
    country: profile.country,
    state,
    city: profile.city,
  });
  const normalizedCurrency = profile.currencyCode?.toUpperCase();
  const currencyCode =
    locationCurrency.code !== "USD"
      ? locationCurrency.code
      : normalizedCurrency ?? locationCurrency.code;
  const currencyLocale = locationCurrency.locale;
  const template = findPermitTemplate(profile.city, state, profile.businessType);
  const riskMultiplier =
    riskTolerance === "high" ? 0.9 : riskTolerance === "low" ? 1.15 : 1;
  const baseCost = convertFromUsd(template.baseCost, currencyCode);
  const estimatedCost = Math.round(baseCost * riskMultiplier);
  const costRatio = baseCost > 0 ? estimatedCost / baseCost : 1;
  const timelineShift =
    riskTolerance === "high" ? -7 : riskTolerance === "low" ? 7 : 0;
  const timelineDays = Math.max(14, template.baseTimelineDays + timelineShift);
  const costItems = template.costItems.map((item) => ({
    ...item,
    amount: Math.max(
      0,
      Math.round(convertFromUsd(item.amount, currencyCode) * costRatio)
    ),
  }));
  const permitChecklist = template.checklist.map((item) => ({
    ...item,
    cost: Math.max(
      0,
      Math.round(convertFromUsd(item.cost, currencyCode) * costRatio)
    ),
  }));
  const risks = [...template.risks];
  if (budget > 0 && budget < estimatedCost) {
    risks.push({
      title: "Budget Gap",
      severity: "high",
      description:
        "Current budget is below expected compliance costs. Adjust scope or secure more funding.",
    });
  }
  const summary = `${profile.businessType} launch in ${profile.city}, ${state} requires ${template.keyPermits.length} core permits with an estimated ${timelineDays}-day timeline.`;

  return {
    city: profile.city,
    state,
    country: profile.country,
    businessType: profile.businessType,
    currencyCode,
    currencyLocale,
    profile: {
      ...profile,
      state,
      currencyCode,
    },
    summary,
    keyPermits: template.keyPermits,
    agencies: template.agencies,
    timelineDays,
    estimatedCost,
    permitChecklist,
    timeline: template.timeline,
    actions: template.actions,
    costItems,
    risks,
    documents: template.documents,
    offices: template.offices,
  };
}
