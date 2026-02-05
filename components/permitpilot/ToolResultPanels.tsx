import { useEffect, useMemo, useState } from "react";
import {
  useCurrentInteractablesSnapshot,
  useTamboInteractable,
  useTamboThread,
} from "@tambo-ai/react";
import PermitSummaryCard from "@/components/permitpilot/generative/PermitSummaryCard";
import CostBreakdownCard from "@/components/permitpilot/generative/CostBreakdownCard";
import RiskFlagsCard from "@/components/permitpilot/generative/RiskFlagsCard";
import DocumentPackCard from "@/components/permitpilot/generative/DocumentPackCard";
import OfficeMapCard from "@/components/permitpilot/generative/OfficeMapCard";
import Panel from "@/components/permitpilot/ui/Panel";
import { findPermitTemplate } from "@/lib/permitpilot/data";
import { convertFromUsd, resolveCurrency } from "@/lib/permitpilot/currency";

interface PermitPack {
  city?: string;
  state?: string;
  country?: string;
  businessType?: string;
  currencyCode?: string;
  currencyLocale?: string;
  profile?: {
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
  };
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
    status: "todo" | "in_progress" | "blocked" | "done";
  }>;
  timeline: Array<{
    id: string;
    title: string;
    targetDate: string;
    owner: string;
    status: "planned" | "active" | "waiting" | "done";
  }>;
  actions: Array<{
    id: string;
    task: string;
    owner: string;
    priority: "low" | "medium" | "high";
    eta: string;
  }>;
  costItems: Array<{ label: string; amount: number }>;
  risks: Array<{ title: string; severity: "low" | "medium" | "high"; description: string }>;
  documents: Array<{ name: string; required: boolean; notes?: string }>;
  offices: Array<{ name: string; address: string; hours?: string }>;
}

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part?.text))
      .filter(Boolean)
      .join(" ");
  }
  if (content && typeof content === "object" && "text" in content) {
    const value = (content as { text?: string }).text;
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

function parsePermitPack(raw: string): PermitPack | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PermitPack>;
    if (!parsed || typeof parsed.summary !== "string") {
      return null;
    }
    if (
      !Array.isArray(parsed.keyPermits) ||
      !Array.isArray(parsed.costItems) ||
      !Array.isArray(parsed.permitChecklist) ||
      !Array.isArray(parsed.timeline) ||
      !Array.isArray(parsed.actions) ||
      typeof parsed.estimatedCost !== "number" ||
      typeof parsed.timelineDays !== "number"
    ) {
      return null;
    }
    return parsed as PermitPack;
  } catch {
    return null;
  }
}

function buildPermitPackFromProfile(profile: PermitPack["profile"]): PermitPack | null {
  if (!profile?.city || !profile.state || !profile.businessType) {
    return null;
  }
  const budget = profile.budget ?? 0;
  const riskTolerance = profile.riskTolerance ?? "medium";
  const locationCurrency = resolveCurrency({
    country: profile.country,
    state: profile.state,
    city: profile.city,
  });
  const normalizedCurrency = profile.currencyCode?.toUpperCase();
  const currencyCode =
    locationCurrency.code !== "USD"
      ? locationCurrency.code
      : normalizedCurrency ?? locationCurrency.code;
  const currencyLocale = locationCurrency.locale;
  const template = findPermitTemplate(
    profile.city,
    profile.state,
    profile.businessType
  );
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
  const summary = `${profile.businessType} launch in ${profile.city}, ${profile.state} requires ${template.keyPermits.length} core permits with an estimated ${timelineDays}-day timeline.`;

  return {
    city: profile.city,
    state: profile.state,
    country: profile.country,
    businessType: profile.businessType,
    currencyCode,
    currencyLocale,
    profile,
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

function extractPermitPack(content: unknown): PermitPack | null {
  const text = extractText(content).trim();
  if (!text) {
    return null;
  }
  const direct = parsePermitPack(text);
  if (direct) {
    return direct;
  }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  return parsePermitPack(text.slice(firstBrace, lastBrace + 1));
}

export default function ToolResultPanels() {
  const { thread } = useTamboThread();
  const interactables = useCurrentInteractablesSnapshot();
  const { updateInteractableComponentProps } = useTamboInteractable();
  const [payload, setPayload] = useState<PermitPack | null>(null);

  const fallbackPayload = useMemo(() => {
    const profile = interactables.find(
      (item) => item.name === "BusinessProfile"
    )?.props as PermitPack["profile"] | undefined;
    return buildPermitPackFromProfile(profile);
  }, [interactables]);

  const latestPayload = useMemo(() => {
    const messages = thread?.messages ?? [];
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role === "user") {
        continue;
      }
      const parsed = extractPermitPack(message.content);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  }, [thread?.messages]);

  useEffect(() => {
    const effectivePayload = latestPayload ?? fallbackPayload;
    if (!effectivePayload) {
      return;
    }
    setPayload(effectivePayload);
  }, [latestPayload, fallbackPayload]);

  useEffect(() => {
    if (!payload) {
      return;
    }
    const checklistId = interactables.find(
      (item) => item.name === "PermitChecklist"
    )?.id;
    const profileId = interactables.find(
      (item) => item.name === "BusinessProfile"
    )?.id;
    const timelineId = interactables.find(
      (item) => item.name === "LaunchTimeline"
    )?.id;
    const actionsId = interactables.find(
      (item) => item.name === "NextActions"
    )?.id;

    if (checklistId) {
      updateInteractableComponentProps(checklistId, {
        items: payload.permitChecklist,
        currencyCode: payload.currencyCode,
        currencyLocale: payload.currencyLocale,
      });
    }
    if (profileId && payload.profile) {
      updateInteractableComponentProps(profileId, payload.profile);
    }
    if (timelineId) {
      updateInteractableComponentProps(timelineId, {
        milestones: payload.timeline,
      });
    }
    if (actionsId) {
      updateInteractableComponentProps(actionsId, {
        actions: payload.actions,
      });
    }
  }, [payload, interactables, updateInteractableComponentProps]);

  if (!payload) {
    return (
      <Panel
        title="Generated Intel"
        eyebrow="Awaiting"
        description="Generative UI cards will appear after the agent fetches permit data."
        tone="glass"
      >
        <p className="text-sm text-slate-600">
          Ask for a permit plan or use a quick prompt to populate the mission
          briefing.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <PermitSummaryCard
        summary={payload.summary}
        keyPermits={payload.keyPermits}
        agencies={payload.agencies}
        timelineDays={payload.timelineDays}
        estimatedCost={payload.estimatedCost}
        currencyCode={payload.currencyCode}
        currencyLocale={payload.currencyLocale}
      />
      <CostBreakdownCard
        items={payload.costItems}
        total={payload.estimatedCost}
        note="Costs adjust based on risk tolerance and budget constraints."
        currencyCode={payload.currencyCode}
        currencyLocale={payload.currencyLocale}
      />
      <RiskFlagsCard flags={payload.risks} />
      <DocumentPackCard documents={payload.documents} />
      <OfficeMapCard
        city={payload.city ?? payload.profile?.city ?? "Austin"}
        offices={payload.offices}
      />
    </div>
  );
}
