import { z } from "zod/v3";
import type { TamboTool } from "@tambo-ai/react";
import { findPermitTemplate } from "@/lib/permitpilot/data";
import { convertFromUsd, resolveCurrency } from "@/lib/permitpilot/currency";

const inputSchema = z.object({
  businessName: z.string().optional().describe("Business name"),
  city: z.string().describe("City of operation"),
  state: z.string().describe("State or region code"),
  country: z.string().optional().describe("Country of operation"),
  currencyCode: z.string().optional().describe("Currency code like USD or INR"),
  businessType: z.string().describe("Business type, e.g. food truck"),
  entityType: z.string().optional().describe("Entity type such as LLC"),
  headcount: z.number().describe("Number of employees"),
  budget: z.number().describe("Compliance budget in local currency"),
  launchWindow: z.string().describe("Target launch window"),
  riskTolerance: z
    .enum(["low", "medium", "high"])
    .describe("Risk tolerance for delays"),
});

const outputSchema = z.object({
  city: z.string().describe("City of operation"),
  state: z.string().describe("State or region code"),
  country: z.string().optional().describe("Country of operation"),
  businessType: z.string().describe("Business type"),
  currencyCode: z.string().describe("Currency code for cost display"),
  currencyLocale: z.string().describe("Locale for currency formatting"),
  profile: z
    .object({
      businessName: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      currencyCode: z.string().optional(),
      businessType: z.string().optional(),
      entityType: z.string().optional(),
      headcount: z.number().optional(),
      budget: z.number().optional(),
      launchWindow: z.string().optional(),
      riskTolerance: z.enum(["low", "medium", "high"]).optional(),
    })
    .optional()
    .describe("Profile fields to update the interactable business card"),
  summary: z.string().describe("Summary of the permit plan"),
  keyPermits: z.array(z.string()).describe("Key permits"),
  agencies: z.array(z.string()).describe("Agencies involved"),
  timelineDays: z.number().describe("Estimated timeline in days"),
  estimatedCost: z.number().describe("Estimated cost in USD"),
  permitChecklist: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        agency: z.string(),
        dueDate: z.string(),
        cost: z.number(),
        status: z.enum(["todo", "in_progress", "blocked", "done"]),
      })
    )
    .describe("Permit checklist items"),
  timeline: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        targetDate: z.string(),
        owner: z.string(),
        status: z.enum(["planned", "active", "waiting", "done"]),
      })
    )
    .describe("Launch timeline milestones"),
  actions: z
    .array(
      z.object({
        id: z.string(),
        task: z.string(),
        owner: z.string(),
        priority: z.enum(["low", "medium", "high"]),
        eta: z.string(),
      })
    )
    .describe("Next actions"),
  costItems: z
    .array(
      z.object({
        label: z.string(),
        amount: z.number(),
      })
    )
    .describe("Cost breakdown items"),
  risks: z
    .array(
      z.object({
        title: z.string(),
        severity: z.enum(["low", "medium", "high"]),
        description: z.string(),
      })
    )
    .describe("Risk flags"),
  documents: z
    .array(
      z.object({
        name: z.string(),
        required: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .describe("Required documents"),
  offices: z
    .array(
      z.object({
        name: z.string(),
        address: z.string(),
        hours: z.string().optional(),
      })
    )
    .describe("Agency offices"),
});

const fetchPermitPack: TamboTool = {
  name: "fetchPermitPack",
  description:
    "Return permit requirements, timeline, costs, and documents for a business.",
  toolSchema: z.function().args(inputSchema).returns(outputSchema),
  tool: async (input) => {
    const {
      city,
      state,
      country,
      currencyCode,
      businessType,
      budget,
      launchWindow,
      riskTolerance,
      businessName,
      entityType,
      headcount,
    } = input;
    const locationCurrency = resolveCurrency({ country, state, city });
    const normalizedCurrency = currencyCode?.toUpperCase();
    const resolvedCurrencyCode =
      locationCurrency.code !== "USD"
        ? locationCurrency.code
        : normalizedCurrency ?? locationCurrency.code;
    const resolvedCurrencyLocale = locationCurrency.locale;
    const template = findPermitTemplate(city, state, businessType);
    const riskMultiplier =
      riskTolerance === "high" ? 0.9 : riskTolerance === "low" ? 1.15 : 1;
    const baseCost = convertFromUsd(template.baseCost, resolvedCurrencyCode);
    const estimatedCost = Math.round(baseCost * riskMultiplier);
    const costRatio = baseCost > 0 ? estimatedCost / baseCost : 1;
    const timelineShift =
      riskTolerance === "high" ? -7 : riskTolerance === "low" ? 7 : 0;
    const timelineDays = Math.max(14, template.baseTimelineDays + timelineShift);

    const costItems = template.costItems.map((item) => ({
      ...item,
      amount: Math.max(
        0,
        Math.round(
          convertFromUsd(item.amount, resolvedCurrencyCode) * costRatio
        )
      ),
    }));

    const risks = [...template.risks];
    if (budget < estimatedCost) {
      risks.push({
        title: "Budget Gap",
        severity: "high",
        description:
          "Current budget is below expected compliance costs. Adjust scope or secure more funding.",
      });
    }

    const summary = `${businessType} launch in ${city}, ${state} requires ${template.keyPermits.length} core permits with an estimated ${timelineDays}-day timeline.`;

    return {
      city,
      state,
      country,
      businessType,
      currencyCode: resolvedCurrencyCode,
      currencyLocale: resolvedCurrencyLocale,
      profile: {
        businessName,
        city,
        state,
        country,
        currencyCode: resolvedCurrencyCode,
        businessType,
        entityType,
        headcount,
        budget,
        launchWindow,
        riskTolerance,
      },
      summary,
      keyPermits: template.keyPermits,
      agencies: template.agencies,
      timelineDays,
      estimatedCost,
      permitChecklist: template.checklist.map((item) => ({
        ...item,
        cost: Math.max(
          0,
          Math.round(convertFromUsd(item.cost, resolvedCurrencyCode) * costRatio)
        ),
      })),
      timeline: template.timeline,
      actions: template.actions,
      costItems,
      risks,
      documents: template.documents,
      offices: template.offices,
    };
  },
};

export const permitPilotTools: TamboTool[] = [fetchPermitPack];
