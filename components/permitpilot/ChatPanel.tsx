import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  useCurrentInteractablesSnapshot,
  useTamboInteractable,
  useTamboThread,
  useTamboThreadInput,
} from "@tambo-ai/react";
import { formatCurrency } from "@/lib/permitpilot/currency";
import {
  buildPermitPackFromProfile,
  type PermitPack,
  type PermitProfile,
} from "@/lib/permitpilot/permitPack";

const quickPrompts = [
  "Open a food truck in Austin with 2 employees.",
  "Switch to a brick-and-mortar restaurant and keep costs under $5k.",
  "Show me the fastest path to launch in 45 days.",
];

function formatMessageContent(content: unknown): string {
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

function isPermitPackContent(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) {
    return false;
  }
  try {
    const parsed = JSON.parse(trimmed) as {
      summary?: unknown;
      permitChecklist?: unknown;
      costItems?: unknown;
    };
    return (
      typeof parsed?.summary === "string" &&
      Array.isArray(parsed?.permitChecklist) &&
      Array.isArray(parsed?.costItems)
    );
  } catch {
    return false;
  }
}

type PermitPackLite = Pick<
  PermitPack,
  | "summary"
  | "keyPermits"
  | "agencies"
  | "timelineDays"
  | "estimatedCost"
  | "costItems"
  | "risks"
  | "documents"
  | "offices"
  | "currencyCode"
  | "currencyLocale"
>;

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

function parsePermitPack(raw: string): PermitPackLite | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PermitPackLite>;
    if (!parsed || typeof parsed.summary !== "string") {
      return null;
    }
    if (
      !Array.isArray(parsed.keyPermits) ||
      !Array.isArray(parsed.costItems) ||
      !Array.isArray(parsed.documents)
    ) {
      return null;
    }
    return parsed as PermitPackLite;
  } catch {
    return null;
  }
}

function extractPermitPack(content: unknown): PermitPackLite | null {
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

export default function ChatPanel() {
  const { thread, sendThreadMessage, isIdle } = useTamboThread();
  const { value, setValue } = useTamboThreadInput();
  const interactables = useCurrentInteractablesSnapshot();
  const { updateInteractableComponentProps } = useTamboInteractable();
  const isPending = !isIdle;
  const [optimisticPack, setOptimisticPack] = useState<PermitPack | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const profileContext = useMemo(() => {
    const profile = interactables.find(
      (item) => item.name === "BusinessProfile"
    )?.props;
    return profile && typeof profile === "object" ? profile : null;
  }, [interactables]);

  const profileId = useMemo(
    () => interactables.find((item) => item.name === "BusinessProfile")?.id,
    [interactables]
  );
  const checklistId = useMemo(
    () => interactables.find((item) => item.name === "PermitChecklist")?.id,
    [interactables]
  );
  const timelineId = useMemo(
    () => interactables.find((item) => item.name === "LaunchTimeline")?.id,
    [interactables]
  );
  const actionsId = useMemo(
    () => interactables.find((item) => item.name === "NextActions")?.id,
    [interactables]
  );

  const getProfileUpdates = (
    message: string,
    profile: Record<string, any> | null
  ) => {
    const updates: Record<string, any> = {};
    const lower = message.toLowerCase();

    const locationMatch = lower.match(
      /\bin\s+([a-z\s]+?)(?:,|\.|with|under|for|$)/
    );
    if (locationMatch) {
      const candidate = locationMatch[1].trim();
      if (candidate && !/\d/.test(candidate)) {
        updates.city =
          candidate
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase() + part.slice(1))
            .join(" ") || updates.city;
      }
    }

    if (lower.includes("fastest") || lower.includes("expedite")) {
      updates.riskTolerance = "high";
    }

    if (lower.includes("food truck")) {
      updates.businessType = "Food Truck";
    }
    if (lower.includes("brick") || lower.includes("restaurant")) {
      updates.businessType = "Restaurant";
    }

    const daysMatch = lower.match(/(\d+)\s*(day|days|week|weeks|month|months)/);
    if (daysMatch) {
      const value = Number(daysMatch[1]);
      const unit = daysMatch[2];
      const normalized = unit.startsWith("week")
        ? `${value} weeks`
        : unit.startsWith("month")
        ? `${value} months`
        : `${value} days`;
      updates.launchWindow = normalized;
    }

    const budgetMatch = lower.match(
      /(under|below|budget|<=)\s*\$?\s*([\d,.]+)\s*(k)?/
    );
    if (budgetMatch) {
      const raw = Number(budgetMatch[2].replace(/,/g, ""));
      updates.budget = budgetMatch[3] ? raw * 1000 : raw;
    }

    if (profile?.currencyCode && typeof updates.budget === "number") {
      updates.budget = Math.max(0, updates.budget);
    }

    return updates;
  };

  const extractLocationQuery = (message: string) => {
    const lower = message.toLowerCase();
    const inMatch = lower.match(
      /\b(?:in|at|near)\s+([a-z\s,.'-]+?)(?:\s+with|\s+under|\s+for|\.|,|$)/
    );
    if (inMatch?.[1]) {
      return inMatch[1].trim();
    }
    return null;
  };

  const resolveLocation = async (query: string) => {
    try {
      const response = await fetch(
        `/api/resolve-location?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as {
        city?: string;
        state?: string;
        country?: string;
        currencyCode?: string;
      };
    } catch {
      return null;
    }
  };

  const sendPrompt = async (prompt: string) => {
    setSendError(null);
    let updates = getProfileUpdates(prompt, profileContext);
    const locationQuery = extractLocationQuery(prompt);
    if (locationQuery) {
      const resolved = await resolveLocation(locationQuery);
      if (resolved) {
        updates = {
          ...updates,
          city: resolved.city ?? updates.city,
          state: resolved.state ?? updates.state,
          country: resolved.country ?? updates.country,
          currencyCode: resolved.currencyCode ?? updates.currencyCode,
        };
      }
    }
    const mergedProfile = profileContext
      ? { ...profileContext, ...updates }
      : updates;

    if (profileId && Object.keys(updates).length > 0) {
      updateInteractableComponentProps(profileId, updates);
    }
    if (checklistId && updates.currencyCode) {
      updateInteractableComponentProps(checklistId, {
        currencyCode: updates.currencyCode,
      });
    }

    const optimistic = buildPermitPackFromProfile(
      mergedProfile as PermitProfile
    );
    if (optimistic) {
      setOptimisticPack(optimistic);
      if (profileId && optimistic.profile) {
        updateInteractableComponentProps(profileId, optimistic.profile);
      }
      if (checklistId) {
        updateInteractableComponentProps(checklistId, {
          items: optimistic.permitChecklist,
          currencyCode: optimistic.currencyCode,
          currencyLocale: optimistic.currencyLocale,
        });
      }
      if (timelineId) {
        updateInteractableComponentProps(timelineId, {
          milestones: optimistic.timeline,
        });
      }
      if (actionsId) {
        updateInteractableComponentProps(actionsId, {
          actions: optimistic.actions,
        });
      }
    }

    try {
      await sendThreadMessage(prompt, {
        streamResponse: false,
        forceToolChoice: "fetchPermitPack",
        additionalContext: mergedProfile
          ? { businessProfile: mergedProfile }
          : undefined,
      });
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : "Unable to contact the agent. Check your API key."
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }
    const prompt = value;
    setValue("");
    await sendPrompt(prompt);
  };

  const visibleMessages =
    thread?.messages?.filter((message) => {
      if (message.role === "tool") {
        return false;
      }
      const content = formatMessageContent(message.content);
      if (
        message.role === "assistant" &&
        !message.renderedComponent &&
        isPermitPackContent(content)
      ) {
        return false;
      }
      return true;
    }) ?? [];

  const lastUserIndex = useMemo(() => {
    const messages = thread?.messages ?? [];
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === "user") {
        return i;
      }
    }
    return -1;
  }, [thread?.messages]);
  const permitPack = useMemo(() => {
    const messages = thread?.messages ?? [];
    if (!messages.length) {
      return null;
    }
    const startIndex = lastUserIndex >= 0 ? lastUserIndex + 1 : 0;
    for (let i = messages.length - 1; i >= startIndex; i -= 1) {
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
  }, [thread?.messages, lastUserIndex]);

  const slides = useMemo(() => {
    const fallbackProfile = interactables.find(
      (item) => item.name === "BusinessProfile"
    )?.props as { currencyCode?: string } | undefined;
    const fallbackChecklist = interactables.find(
      (item) => item.name === "PermitChecklist"
    )?.props as { items?: Array<{ title: string; cost: number }> } | undefined;
    const fallbackPermits =
      fallbackChecklist?.items?.map((item) => item.title) ?? [];
    const fallbackCosts =
      fallbackChecklist?.items?.map((item) =>
        `${item.title} ${formatCurrency(
          item.cost ?? 0,
          fallbackProfile?.currencyCode
        )}`
      ) ?? [];
    const fallbackTotal =
      fallbackChecklist?.items?.reduce(
        (sum, item) => sum + (item.cost ?? 0),
        0
      ) ?? 0;

    const effectivePack = permitPack ?? optimisticPack;

    if (!effectivePack && lastUserIndex >= 0) {
      return [
        {
          title: "Generating",
          items: [
            "Preparing permit summary",
            "Calculating costs",
            "Collecting required documents",
            "Scanning risks and compliance flags",
            "Mapping agency offices",
          ],
          meta: "Processing your latest prompt...",
        },
      ];
    }

    if (!effectivePack) {
      if (!fallbackPermits.length) {
        return [];
      }
      return [
        {
          title: "Permits",
          items: fallbackPermits,
          meta: "From current checklist",
        },
        {
          title: "Costs",
          items: fallbackCosts,
          meta: `Total ${formatCurrency(
            fallbackTotal,
            fallbackProfile?.currencyCode
          )}`,
        },
        {
          title: "Documents",
          items: ["See generated document pack."],
          meta: "Submission checklist",
        },
        {
          title: "Risks",
          items: ["See risk flags card."],
          meta: "Compliance flags",
        },
        {
          title: "Offices",
          items: ["See agency touchpoints card."],
          meta: "Where to go",
        },
      ];
    }
    return [
      {
        title: "Permits",
        items: effectivePack.keyPermits,
        meta: effectivePack.summary,
      },
      {
        title: "Costs",
        items: effectivePack.costItems.map((item) =>
          `${item.label} ${formatCurrency(
            item.amount,
            effectivePack.currencyCode,
            effectivePack.currencyLocale
          )}`
        ),
        meta: `Total ${formatCurrency(
          effectivePack.estimatedCost,
          effectivePack.currencyCode,
          effectivePack.currencyLocale
        )}`,
      },
      {
        title: "Documents",
        items: effectivePack.documents.map((doc) =>
          `${doc.name}${doc.required ? " (Required)" : " (Optional)"}`
        ),
        meta: "Submission checklist",
      },
      {
        title: "Risks",
        items: effectivePack.risks?.length
          ? effectivePack.risks.map((risk) => risk.title)
          : ["No major risks flagged"],
        meta: "Compliance flags",
      },
      {
        title: "Offices",
        items: effectivePack.offices?.length
          ? effectivePack.offices.map((office) => office.name)
          : effectivePack.agencies,
        meta: "Where to go",
      },
    ];
  }, [permitPack, optimisticPack, interactables, lastUserIndex]);
  const slidesAvailable = slides.length > 0;
  const displayMessages = slidesAvailable
    ? visibleMessages.filter((message) => message.role !== "assistant")
    : visibleMessages;
  const compactMessages = useMemo(() => {
    const output: typeof visibleMessages = [];
    let pendingAssistant: (typeof visibleMessages)[number] | null = null;
    for (const message of displayMessages) {
      if (message.role === "assistant") {
        pendingAssistant = message;
        continue;
      }
      if (message.role === "user") {
        if (pendingAssistant) {
          output.push(pendingAssistant);
          pendingAssistant = null;
        }
        output.push(message);
      }
    }
    if (pendingAssistant) {
      output.push(pendingAssistant);
    }
    return output;
  }, [displayMessages]);
  const hasMessages = compactMessages.length > 0;
  const numberedMessages = useMemo(() => {
    let assistantIndex = 0;
    let userIndex = 0;
    return compactMessages.map((message) => {
      if (message.role === "assistant") {
        assistantIndex += 1;
        return { ...message, sequence: `Step ${assistantIndex}` };
      }
      if (message.role === "user") {
        userIndex += 1;
        return { ...message, sequence: `Prompt ${userIndex}` };
      }
      return { ...message, sequence: undefined };
    });
  }, [compactMessages]);
  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    setSlideIndex(0);
  }, [permitPack, lastUserIndex]);
  useEffect(() => {
    if (permitPack) {
      setOptimisticPack(null);
    }
  }, [permitPack]);

  const statusBadgeClass = isPending
    ? "border-amber-200 bg-amber-50 text-amber-700"
    : "border-slate-200/70 bg-slate-50 text-slate-500";

  return (
    <section className="flex min-h-[520px] flex-col rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Mission Control
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Chat + Generative UI
          </h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusBadgeClass}`}
        >
          {isPending ? "Synthesizing" : "Live"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          className="flex-1 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          placeholder="Describe the business, constraints, and timeline..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Send
        </button>
      </form>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-2">
        {slides.length > 0 ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Slides
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {slides[slideIndex]?.title}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                  onClick={() =>
                    setSlideIndex((prev) =>
                      prev === 0 ? slides.length - 1 : prev - 1
                    )
                  }
                >
                  Prev
                </button>
                <span>
                  {slideIndex + 1} / {slides.length}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-2 py-1 text-xs"
                  onClick={() =>
                    setSlideIndex((prev) =>
                      prev === slides.length - 1 ? 0 : prev + 1
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
            {slides[slideIndex]?.meta ? (
              <p className="mt-2 text-xs text-slate-500">
                {slides[slideIndex].meta}
              </p>
            ) : null}
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {slides[slideIndex]?.items?.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                    index === slideIndex
                      ? "bg-slate-900 text-slate-50"
                      : "border border-slate-200 text-slate-500"
                  }`}
                >
                  {slide.title}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {sendError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {sendError}
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-200/70 bg-slate-50/60 px-4 py-4">
            <p className="text-sm text-slate-600">
              Start a mission briefing. The AI will select components and update
              the live panels on the left.
            </p>
          </div>
          <div className="grid gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                onClick={async () => {
                  await sendPrompt(prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {hasMessages
          ? numberedMessages.map((message) => {
              const content = formatMessageContent(message.content);
              return (
                <div
                  key={message.id}
                  className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                    message.role === "user"
                      ? "border-slate-900 bg-slate-900 text-slate-50"
                      : "border-slate-200/70 bg-white text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    <span>{message.role === "user" ? "Operator" : "Agent"}</span>
                    {message.sequence ? <span>{message.sequence}</span> : null}
                  </div>
                  {content ? (
                    <p className="mt-2 whitespace-pre-wrap">{content}</p>
                  ) : null}
                </div>
              );
            })
          : null}
      </div>

    </section>
  );
}
