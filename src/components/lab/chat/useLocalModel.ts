import { useCallback, useEffect, useState } from "react";
import type { LoadProgress, LocalModelAdapter, SupportReport } from "@/lib/ai/model/types";
import { useSettings } from "@/lib/settings";

export type ModelState =
  | { phase: "checking" }
  | { phase: "unsupported"; support: SupportReport }
  | { phase: "idle"; support: SupportReport }
  | { phase: "loading"; progress: LoadProgress }
  | { phase: "ready" }
  | { phase: "error"; message: string };

// One adapter per choice per page session so models stay loaded across reports.
const adapters = new Map<string, Promise<LocalModelAdapter>>();
function getAdapter(key: string, url: string, model: string) {
  let p = adapters.get(key);
  if (!p) {
    p = key === "gemma"
      ? import("@/lib/ai/model/gemma").then((m) => m.createGemmaAdapter())
      : import("@/lib/ai/model/ollama").then((m) => m.createOllamaAdapter(url, model));
    adapters.set(key, p);
  }
  return p;
}

export function useLocalModel() {
  const s = useSettings();
  const { enabled, url, model } = s.ollama;
  const key = enabled ? `ollama|${url}|${model}` : "gemma";
  const [state, setState] = useState<ModelState>({ phase: "checking" });
  const [adapter, setAdapter] = useState<LocalModelAdapter | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState({ phase: "checking" });
    setAdapter(null);
    getAdapter(key, url, model).then(async (a) => {
      if (cancelled) return;
      setAdapter(a);
      if (a.isLoaded()) return setState({ phase: "ready" });
      const support = await a.checkSupport();
      if (!cancelled) setState(support.supported ? { phase: "idle", support } : { phase: "unsupported", support });
    });
    return () => { cancelled = true; };
  }, [key, url, model]);

  const load = useCallback(async () => {
    if (!adapter) return;
    setState({ phase: "loading", progress: { label: "Starting…", pct: 0 } });
    try {
      await adapter.load((progress) => setState({ phase: "loading", progress }));
      setState({ phase: "ready" });
    } catch (e) {
      setState({ phase: "error", message: e instanceof Error ? e.message : "Could not load the model." });
    }
  }, [adapter]);

  return { state, adapter, ready: state.phase === "ready" && !!adapter, load, usingOllama: enabled };
}
