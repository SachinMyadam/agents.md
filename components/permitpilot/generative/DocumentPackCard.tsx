import Panel from "@/components/permitpilot/ui/Panel";

export interface DocumentItem {
  name: string;
  required: boolean;
  notes?: string;
}

export interface DocumentPackCardProps {
  documents: DocumentItem[];
}

export default function DocumentPackCard({
  documents = [],
}: DocumentPackCardProps) {
  return (
    <Panel
      title="Document Pack"
      eyebrow="Generated"
      description="What you need before submitting applications."
    >
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.name}
            className="rounded-2xl border border-slate-200/60 bg-white/90 px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">{doc.name}</p>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  doc.required
                    ? "bg-slate-900 text-slate-50"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {doc.required ? "Required" : "Optional"}
              </span>
            </div>
            {doc.notes ? (
              <p className="mt-2 text-xs text-slate-500">{doc.notes}</p>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}
