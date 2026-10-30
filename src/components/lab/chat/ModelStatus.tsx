import { Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModelState } from "./useLocalModel";

export function ModelStatus({ state, onLoad, label }: { state: ModelState; onLoad: () => void; downloadSize?: string | undefined; label?: string | undefined; ollama?: boolean }) {
  const box = "rounded-xl border border-border bg-card p-3 text-xs";
  switch (state.phase) {
    case "checking":
    case "loading":
      return <div className={box} aria-live="polite"><Loader2 className="mr-1 inline h-3 w-3 animate-spin" />Connecting to Ollama…</div>;
    case "ready":
      return <div className={box}><Cpu className="mr-1 inline h-3.5 w-3.5 text-status-in" />{label ?? "Ollama"} on this laptop.</div>;
    case "error":
      return (
        <div className={box}>
          <p>Start Ollama to get friendlier answers. <span className="text-muted-foreground">{state.message}</span></p>
          <Button size="sm" variant="outline" className="mt-2" onClick={onLoad}>Retry</Button>
        </div>
      );
  }
}
