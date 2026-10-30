import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings";
import type { ModelState } from "./useLocalModel";

type Tone = "ok" | "bad" | "wait";
const dot: Record<Tone, string> = { ok: "bg-status-in", bad: "bg-destructive", wait: "bg-muted-foreground animate-pulse" };

function Line({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot[tone]}`} aria-hidden />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export function ModelStatus({ state, onLoad }: { state: ModelState; onLoad: () => void; downloadSize?: string | undefined; label?: string | undefined; ollama?: boolean }) {
  const { model } = useSettings().ollama;
  const waiting = state.phase === "checking" || state.phase === "loading";
  const msg = state.phase === "error" ? state.message : "";
  const notRunning = state.phase === "error" && !msg.startsWith("Model not downloaded");

  const conn: [string, Tone] = waiting ? ["Connecting…", "wait"] : notRunning ? ["Not running", "bad"] : ["Connected", "ok"];
  const mod: [string, Tone] = waiting ? [`${model} · checking…`, "wait"]
    : state.phase === "ready" ? [`${model} · ready`, "ok"]
    : notRunning ? [`${model} · unknown`, "wait"] : [`${model} · not downloaded`, "bad"];

  return (
    <div className="space-y-1.5 rounded-xl border border-border bg-card p-3 text-xs" aria-live="polite">
      <Line label="Ollama" value={conn[0]} tone={conn[1]} />
      <Line label="Model" value={mod[0]} tone={mod[1]} />
      {state.phase === "error" && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <code className="rounded bg-muted px-1.5 py-0.5">{notRunning ? "ollama serve" : `ollama pull ${model}`}</code>
          <Button size="sm" variant="outline" className="h-7" onClick={onLoad}>
            {waiting && <Loader2 className="h-3 w-3 animate-spin" />}Retry
          </Button>
        </div>
      )}
    </div>
  );
}
