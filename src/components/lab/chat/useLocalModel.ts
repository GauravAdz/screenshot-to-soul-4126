import { useCallback, useEffect, useState } from "react";
import type { LoadProgress, LocalModelAdapter } from "@/lib/ai/model/types";
import { createOllamaAdapter } from "@/lib/ai/model/ollama";
import { useSettings } from "@/lib/settings";

export type ModelState =
  | { phase: "checking" }
  | { phase: "loading"; progress: LoadProgress }
  | { phase: "ready" }
  | { phase: "error"; message: string };

// Ollama on this laptop is the only model. One adapter per url+model per page session.
const adapters = new Map<string, LocalModelAdapter>();
function getAdapter(url: string, model: string) {
  const key = `${url}|${model}`;
  if (!adapters.has(key)) adapters.set(key, createOllamaAdapter(url, model));
  return adapters.get(key)!;
}

export function useLocalModel() {
  const { url, model } = useSettings().ollama;
  const adapter = getAdapter(url, model);
  const [state, setState] = useState<ModelState>({ phase: adapter.isLoaded() ? "ready" : "checking" });

  const load = useCallback(async () => {
    setState({ phase: "loading", progress: { label: "Connecting to Ollama…", pct: null } });
    try {
      await adapter.load(() => {});
      setState({ phase: "ready" });
    } catch (e) {
      setState({ phase: "error", message: e instanceof Error ? e.message : "Couldn't connect to Ollama." });
    }
  }, [adapter]);

  useEffect(() => {
    if (!adapter.isLoaded()) void load();
    else setState({ phase: "ready" });
  }, [adapter, load]);

  return { state, adapter, ready: state.phase === "ready", load, usingOllama: true };
}
