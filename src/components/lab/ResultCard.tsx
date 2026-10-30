import { useState } from "react";
import { ChevronDown, AlertTriangle, FileText } from "lucide-react";
import { classify, rangePosition, STATUS_LABEL } from "@/lib/lab/engine";
import { explain } from "@/lib/lab/explanations";
import type { LabResult, Status } from "@/lib/lab/types";
import { cn } from "@/lib/utils";

export const STATUS_STYLE: Record<Status, string> = {
  below: "bg-status-low-soft text-status-low",
  within: "bg-status-in-soft text-status-in",
  above: "bg-status-high-soft text-status-high",
  unknown: "bg-status-unknown-soft text-status-unknown",
};
const DOT: Record<Status, string> = {
  below: "bg-status-low",
  within: "bg-status-in",
  above: "bg-status-high",
  unknown: "bg-status-unknown",
};

export function ResultCard({ r, index = 0 }: { r: LabResult; index?: number }) {
  const [open, setOpen] = useState(false);
  const c = classify(r);
  const pos = rangePosition(r);
  const ex = explain(r.name);

  return (
    <article
      className="fade-up flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-sans text-base font-semibold leading-tight">{r.name}</h3>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLE[c.status])}>
          {STATUS_LABEL[c.status]}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold">{r.valueRaw || "—"}</span>
        <span className="text-sm text-muted-foreground">{r.unit}</span>
        {r.flag && <span className="ml-auto text-xs text-muted-foreground">Lab flag: {r.flag}</span>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Lab reference range: {r.rangeRaw ? `${r.rangeRaw} ${r.rangeUnit || r.unit}`.trim() : "not shown on report"}
      </p>

      {pos ? (
        <div className="mt-4" aria-hidden>
          <div className="relative h-2 rounded-full bg-muted">
            <div className="absolute inset-y-0 rounded-full bg-status-in/30" style={{ left: `${pos.lo * 100}%`, width: `${(pos.hi - pos.lo) * 100}%` }} />
            <div
              className={cn("absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card shadow", DOT[c.status])}
              style={{ left: `${pos.v * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>lower</span><span>printed range</span><span>higher</span>
          </div>
        </div>
      ) : null}

      {c.uncertainties.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-xl bg-status-high-soft/60 p-3 text-xs text-foreground">
          {c.uncertainties.map((u) => (
            <li key={u} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-high" />{u}</li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-4 flex items-center justify-between rounded-xl px-1 text-sm font-medium text-primary hover:underline"
      >
        What does this measure?
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="fade-up mt-2 space-y-2 text-sm text-muted-foreground">
          <p>{ex ? ex.what : "We don't have a plain-language description for this test yet. Ask your clinician what it measures."}</p>
          <p>{c.basis} Being inside or outside a range is not a diagnosis — your clinician interprets results in context.</p>
          <p className="flex items-center gap-1 text-xs"><FileText className="h-3.5 w-3.5" />{r.page ? `Source: page ${r.page}` : "Added manually"}{r.sourceLine && ` · “${r.sourceLine}”`}</p>
        </div>
      )}
    </article>
  );
}
