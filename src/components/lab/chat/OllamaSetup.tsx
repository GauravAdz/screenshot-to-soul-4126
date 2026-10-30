import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isLoopbackUrl, listOllamaModels } from "@/lib/ai/model/ollama";
import { updateSettings, useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** Lets the user point the chat at their own Ollama running on this computer. */
export function OllamaSetup() {
  const s = useSettings();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(s.ollama.url);
  const [models, setModels] = useState<string[] | null>(null);
  const [model, setModel] = useState(s.ollama.model);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const find = async () => {
    setBusy(true); setErr(null);
    try {
      const m = await listOllamaModels(url);
      setModels(m);
      if (!m.length) setErr("Ollama is running but has no models. Try: ollama pull llama3.2");
      else if (!m.includes(model)) setModel(m[0]!);
    } catch (e) {
      setModels(null);
      setErr(e instanceof Error ? e.message : "Couldn't reach Ollama.");
    } finally { setBusy(false); }
  };

  return (
    <div className="rounded-xl border border-border bg-card text-xs">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-3 py-2 font-medium">
        {s.ollama.enabled ? `Using my Ollama · ${s.ollama.model}` : "Use my Ollama"}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-border p-3">
          <p className="text-muted-foreground">
            Start Ollama with <code className="rounded bg-muted px-1">OLLAMA_ORIGINS={origin}</code>. Only this computer is allowed.
          </p>
          <div className="flex gap-1.5">
            <label className="sr-only" htmlFor="ollama-url">Ollama address</label>
            <input id="ollama-url" value={url} onChange={(e) => setUrl(e.target.value)} className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2" />
            <Button size="sm" variant="outline" onClick={find} disabled={busy || !isLoopbackUrl(url)}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Find models"}
            </Button>
          </div>
          {!isLoopbackUrl(url) && <p className="text-destructive">Use a localhost address, like http://localhost:11434.</p>}
          {err && <p className="text-destructive">{err}</p>}
          {models && models.length > 0 && (
            <div className="flex gap-1.5">
              <label className="sr-only" htmlFor="ollama-model">Model</label>
              <select id="ollama-model" value={model} onChange={(e) => setModel(e.target.value)} className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-1.5">
                {models.map((m) => <option key={m}>{m}</option>)}
              </select>
              <Button size="sm" onClick={() => { updateSettings({ ollama: { enabled: true, url, model } }); setOpen(false); }}>Use it</Button>
            </div>
          )}
          {s.ollama.enabled && (
            <Button size="sm" variant="ghost" onClick={() => updateSettings({ ollama: { ...s.ollama, enabled: false } })}>Stop using Ollama</Button>
          )}
        </div>
      )}
    </div>
  );
}
