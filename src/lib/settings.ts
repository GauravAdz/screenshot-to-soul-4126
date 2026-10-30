import { useSyncExternalStore } from "react";

/** Non-medical preferences, stored on this device only. */
export interface Settings {
  theme: "light" | "dark";
  voice: "local" | "cloud" | "off";
  /** Explicit, informed consent to send short narration text to ElevenLabs. */
  cloudVoiceConsent: { given: boolean; at: number | null };
  speed: number;
  autoSpeakAnswers: boolean;
  /** Use the user's own Ollama on this computer (localhost only) for wording answers. */
  ollama: { enabled: boolean; url: string; model: string };
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  voice: "local",
  cloudVoiceConsent: { given: false, at: null },
  speed: 1,
  autoSpeakAnswers: false,
  ollama: { enabled: true, url: "http://localhost:11434", model: "medgemma1.5:4b" },
};

const KEY = "clearlab-settings";
const listeners = new Set<() => void>();
let cache: Settings | null = null;

export function getSettings(): Settings {
  if (cache) return cache;
  if (typeof localStorage === "undefined") return DEFAULT_SETTINGS;
  try {
    cache = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
    // Older saved settings had no Ollama model; use the default Ollama setup instead.
    if (!cache!.ollama?.model) cache = { ...cache!, ollama: DEFAULT_SETTINGS.ollama };
  } catch {
    cache = DEFAULT_SETTINGS;
  }
  // Cloud voice is never active without consent.
  if (cache!.voice === "cloud" && !cache!.cloudVoiceConsent.given) cache = { ...cache!, voice: "local" };
  return cache!;
}

export function updateSettings(patch: Partial<Settings>) {
  cache = { ...getSettings(), ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function resetSettingsCache() {
  cache = null;
  listeners.forEach((l) => l());
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    getSettings,
    () => DEFAULT_SETTINGS,
  );
}
