import { z } from "zod/v3";
import type { TamboComponent } from "@tambo-ai/react";
import PermitSummaryCard from "@/components/permitpilot/generative/PermitSummaryCard";
import CostBreakdownCard from "@/components/permitpilot/generative/CostBreakdownCard";
import RiskFlagsCard from "@/components/permitpilot/generative/RiskFlagsCard";
import DocumentPackCard from "@/components/permitpilot/generative/DocumentPackCard";
import OfficeMapCard from "@/components/permitpilot/generative/OfficeMapCard";

const permitSummarySchema = z.object({
  summary: z.string().describe("Short summary of required permits"),
  keyPermits: z
    .array(z.string())
    .describe("Most important permits for launch"),
  agencies: z.array(z.string()).describe("Agencies involved"),
  timelineDays: z.number().describe("Estimated total timeline in days"),
  estimatedCost: z.number().describe("Estimated total cost in local currency"),
  currencyCode: z.string().optional().describe("Currency code for costs"),
  currencyLocale: z.string().optional().describe("Locale for currency format"),
});

const costBreakdownSchema = z.object({
  items: z
    .array(
      z.object({
        label: z.string().describe("Cost category"),
        amount: z.number().describe("Cost in local currency"),
      })
    )
    .describe("Line-item cost breakdown"),
  total: z.number().describe("Total cost in local currency"),
  note: z.string().optional().describe("Optional note or caveat"),
  currencyCode: z.string().optional().describe("Currency code for costs"),
  currencyLocale: z.string().optional().describe("Locale for currency format"),
});

const riskFlagsSchema = z.object({
  flags: z
    .array(
      z.object({
        title: z.string().describe("Risk title"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("Risk severity"),
        description: z.string().describe("Why this risk matters"),
      })
    )
    .describe("Risk flags and compliance warnings"),
});

const documentPackSchema = z.object({
  documents: z
    .array(
      z.object({
        name: z.string().describe("Document name"),
        required: z.boolean().describe("Whether the document is required"),
        notes: z.string().optional().describe("Additional guidance"),
      })
    )
    .describe("Documents required for submission"),
});

const officeMapSchema = z.object({
  city: z.string().describe("Primary city"),
  offices: z
    .array(
      z.object({
        name: z.string().describe("Office name"),
        address: z.string().describe("Office address"),
        hours: z.string().optional().describe("Office hours"),
      })
    )
    .describe("Agency offices to visit"),
});

export const permitPilotComponents: TamboComponent[] = [
  {
    name: "PermitSummaryCard",
    description:
      "Summarizes the required permits, timeline, and agencies for a business.",
    component: PermitSummaryCard,
    propsSchema: permitSummarySchema,
  },
  {
    name: "CostBreakdownCard",
    description:
      "Shows a breakdown of compliance costs with a total and optional notes.",
    component: CostBreakdownCard,
    propsSchema: costBreakdownSchema,
  },
  {
    name: "RiskFlagsCard",
    description:
      "Highlights compliance risks, delays, or policy constraints that need attention.",
    component: RiskFlagsCard,
    propsSchema: riskFlagsSchema,
  },
  {
    name: "DocumentPackCard",
    description: "Lists the documents needed for permit submissions.",
    component: DocumentPackCard,
    propsSchema: documentPackSchema,
  },
  {
    name: "OfficeMapCard",
    description:
      "Shows key agency offices and locations related to the permit process.",
    component: OfficeMapCard,
    propsSchema: officeMapSchema,
  },
];
