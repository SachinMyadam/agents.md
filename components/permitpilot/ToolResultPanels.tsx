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
import {
  buildPermitPackFromProfile,
  type PermitPack,
} from "@/lib/permitpilot/permitPack";

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
