import { CircleCheck, CircleHelp, CircleAlert, Siren, ImageOff, Ruler } from "lucide-react";
import { classify } from "@/lib/lab/engine";
import type { LabReport } from "@/lib/lab/types";
import { overviewCounts, overviewNarration } from "@/lib/speech/narration";
import { cn } from "@/lib/utils";
import { SpeakButton } from "./voice/VoicePlayer";

export function ReportOverview({ report, onJump }: { report: LabReport; onJump: (id: string) => void }) {
  const c = overviewCounts(report);
  const critical = report.results.filter((r) => r.critical);
  const unreadable = report.results.filter((r) => r.needsReview);
  const noRange = report.results.filter((r) => !r.needsReview && classify(r).status === "unknown");

  const tiles = [
    { n: c.within, label: "Within range", icon: CircleCheck, cls: "bg-status-in-soft text-status-in" },
    { n: c.above + c.below, label: "Outside range", icon: CircleAlert, cls: "bg-status-high-soft text-status-high" },
    { n: c.unknown, label: "Can't compare", icon: CircleHelp, cls: "bg-status-unknown-soft text-status-unknown" },
  ];

  return (
    <section aria-labelledby="overview-h" className="sketch-card fade-up p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="overview-h" className="text-xl font-semibold">{c.total} results</h2>
        <SpeakButton text={overviewNarration(report)} label="Report overview" className="rounded-full border border-border">Listen</SpeakButton>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className={cn("flex flex-col items-center rounded-2xl p-3 text-center", t.cls)}>
            <t.icon className="h-5 w-5" aria-hidden />
            <p className="mt-1 font-display text-2xl font-semibold">{t.n}</p>
            <p className="text-xs font-medium">{t.label}</p>
          </div>
        ))}
      </div>

      {critical.length > 0 && (
        <div role="alert" className="mt-4 rounded-2xl border border-destructive/50 bg-destructive/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-destructive"><Siren className="h-4 w-4" /> Your lab marked {critical.length} result{critical.length > 1 ? "s" : ""} as critical</p>
          <p className="mt-1">Please follow your lab's or doctor's instructions.</p>
          <Chips items={critical.map((r) => ({ id: r.id, text: `${r.name}: ${r.valueRaw} ${r.unit}` }))} onJump={onJump} />
        </div>
      )}

      {unreadable.length > 0 && (
        <Note icon={ImageOff} text={`${unreadable.length} result${unreadable.length > 1 ? "s" : ""} couldn't be read clearly`} items={unreadable} onJump={onJump} />
      )}
      {noRange.length > 0 && (
        <Note icon={Ruler} text={`${noRange.length} result${noRange.length > 1 ? "s" : ""} couldn't be checked against a lab range`} items={noRange} onJump={onJump} />
      )}
    </section>
  );
}

function Note({ icon: Icon, text, items, onJump }: { icon: typeof Ruler; text: string; items: { id: string; name: string }[]; onJump: (id: string) => void }) {
  return (
    <details className="mt-3 rounded-2xl bg-muted/60 p-3 text-sm">
      <summary className="flex cursor-pointer items-center gap-2 font-medium"><Icon className="h-4 w-4 text-muted-foreground" /> {text}</summary>
      <Chips items={items.map((r) => ({ id: r.id, text: r.name }))} onJump={onJump} />
    </details>
  );
}

function Chips({ items, onJump }: { items: { id: string; text: string }[]; onJump: (id: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((r) => <button key={r.id} onClick={() => onJump(r.id)} className="rounded-full bg-card px-2.5 py-1 text-xs font-medium hover:underline">{r.text}</button>)}
    </div>
  );
}
