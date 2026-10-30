import { useState } from "react";
import { ChevronDown, AlertTriangle, FileText, MessageCircle, Siren, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { classify, rangePosition, STATUS_LABEL } from "@/lib/lab/engine";
import { explain } from "@/lib/lab/explanations";
import type { Trend } from "@/lib/lab/trends";
import type { LabResult, Status } from "@/lib/lab/types";
import { resultNarration } from "@/lib/speech/narration";
import { cn } from "@/lib/utils";
import { TrendChart } from "./TrendChart";
import { SpeakButton } from "./voice/VoicePlayer";

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

interface Props {
  r: LabResult;
  index?: number;
  trend?: Trend | undefined;
  onExplain?: ((r: LabResult) => void) | undefined;
  onFollowUp?: ((r: LabResult) => void) | undefined;
}

function firstSentence(s: string) {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}

export function ResultCard({ r, index = 0, trend, onExplain, onFollowUp }: Props) {
  const [open, setOpen] = useState(false);
  const c = classify(r);
  const pos = rangePosition(r);
  const ex = explain(r.name);
  const title = ex?.title || r.name;
  const rangeText = r.rangeRaw ? `${r.rangeRaw} ${r.rangeUnit || r.unit}`.trim() : "not shown on report";

  return (
    <article
      className={cn("sketch-card fade-up p-5", r.critical && "border-destructive/60")}
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      aria-labelledby={`t-${r.id}`}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full", STATUS_STYLE[c.status])} aria-hidden>
          <FlaskConical className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id={`t-${r.id}`} className="font-sans text-base font-semibold leading-tight">{title}</h3>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLE[c.status])}>{STATUS_LABEL[c.status]}</span>
          </div>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-semibold">{r.valueRaw || "—"}</span>
            <span className="text-sm text-muted-foreground">{r.unit}</span>
          </p>
        </div>
      </div>

      {r.critical && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive">
          <Siren className="h-3.5 w-3.5" /> Your lab marked this as critical
        </p>
      )}

      {pos && (
        <div className="mt-4">
          <p className="sr-only">{`${r.valueRaw} ${r.unit}, ${STATUS_LABEL[c.status].toLowerCase()}, lab range ${rangeText}.`}</p>
          <div className="relative h-2 rounded-full bg-muted" aria-hidden>
            <div className="range-grow absolute inset-y-0 rounded-full bg-status-in/35" style={{ left: `${pos.lo * 100}%`, width: `${(pos.hi - pos.lo) * 100}%` }} />
            <div className={cn("marker-in absolute top-1/2 h-4 w-4 rounded-full border-2 border-card shadow", DOT[c.status])} style={{ left: `${pos.v * 100}%` }} />
          </div>
        </div>
      )}

      {ex && <p className="mt-3 text-sm text-muted-foreground">{firstSentence(ex.what)}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-1">
        {onExplain && <Button size="sm" variant="secondary" className="rounded-full" onClick={() => onExplain(r)}>What does this mean?</Button>}
        <SpeakButton text={resultNarration(r)} label={title} className="rounded-full">Listen</SpeakButton>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="ml-auto flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-primary hover:underline">
          More details <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="fade-up mt-3 space-y-2 border-t border-dashed border-border pt-3 text-sm text-muted-foreground">
          {title !== r.name && <p>Name on report: <span className="text-foreground">{r.name}</span></p>}
          <p>Lab range: <span className="text-foreground">{rangeText}</span>{r.flag && ` · Lab flag: ${r.flag}`}</p>
          {ex && ex.what !== firstSentence(ex.what) && <p>{ex.what}</p>}
          {c.uncertainties.length > 0 && (
            <ul className="space-y-1">
              {c.uncertainties.map((u) => <li key={u} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-high" />{u}</li>)}
            </ul>
          )}
          {trend && <TrendChart trend={trend} low={r.rangeLow} high={r.rangeHigh} unit={r.unit} />}
          <p className="flex items-center gap-1 text-xs"><FileText className="h-3.5 w-3.5" />{r.page ? `Page ${r.page}` : "Added by you"}</p>
          {onFollowUp && <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onFollowUp(r)}><MessageCircle className="h-3.5 w-3.5" /> Ask a question</Button>}
        </div>
      )}
    </article>
  );
}
