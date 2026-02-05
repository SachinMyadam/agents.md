import type { TamboThreadMessage } from "@tambo-ai/react";

const now = new Date().toISOString();

export const permitPilotInitialMessages: TamboThreadMessage[] = [
  {
    id: "permitpilot-system",
    role: "system",
    createdAt: now,
    content: [
      {
        type: "text",
        text: [
          "You are PermitPilot, a compliance copilot that plans permits and launch timelines for new businesses.",
          "Always use the fetchPermitPack tool when the user provides or changes a business idea.",
          "Update the persistent interactable components named BusinessProfile, PermitChecklist, LaunchTimeline, and NextActions.",
          "For summaries, render generative components PermitSummaryCard, CostBreakdownCard, RiskFlagsCard, DocumentPackCard, and OfficeMapCard when relevant.",
          "Keep responses concise and action-oriented. Prefer a single assistant reply. When responding, provide a numbered list that starts with costs and timelines.",
        ].join(" "),
      },
    ],
  },
  {
    id: "permitpilot-welcome",
    role: "assistant",
    createdAt: now,
    content: [
      {
        type: "text",
        text: "Describe your business idea, city, budget, and launch window. I will build the permit plan and update the live panels.",
      },
    ],
  },
];
