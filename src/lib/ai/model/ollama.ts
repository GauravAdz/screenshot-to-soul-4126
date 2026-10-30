import type { ChatMessage } from "../prompt";
import type { LocalModelAdapter, SupportReport } from "./types";

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

/** Only Ollama on this same computer is allowed, so prompts never leave the device. */
export function isLoopbackUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  } catch {
    return false;
  }
}

const base = (url: string) => url.replace(/\/+$/, "");

const unsupported = (reason: string): SupportReport => ({
  supported: false,
  reasons: [reason],
  details: { webgpu: false, shaderF16: false, maxBufferMB: null, deviceMemoryGB: null },
});

export async function listOllamaModels(url: string): Promise<string[]> {
  if (!isLoopbackUrl(url)) throw new Error("Ollama must run on this computer (localhost).");
  let res: Response;
  try {
    res = await fetch(`${base(url)}/api/tags`);
  } catch {
    throw new Error("Couldn't reach Ollama. Is it running, and is OLLAMA_ORIGINS set to allow this site?");
  }
  if (!res.ok) throw new Error(`Ollama answered with an error (${res.status}).`);
  const data = (await res.json()) as { models?: { name: string }[] };
  return (data.models ?? []).map((m) => m.name);
}

export function createOllamaAdapter(url: string, model: string): LocalModelAdapter {
  let loaded = false;
  return {
    id: `ollama:${model}`,
    label: `Ollama (${model})`,
    downloadSize: "already on your computer",
    async checkSupport() {
      if (!isLoopbackUrl(url)) return unsupported("Ollama must run on this computer (localhost).");
      if (!model) return unsupported("Choose an Ollama model first.");
      return { ...unsupported(""), supported: true, reasons: [] };
    },
    async load(onProgress) {
      onProgress({ label: "Connecting to Ollama…", pct: null });
      const models = await listOllamaModels(url);
      if (!models.includes(model)) throw new Error(`Model "${model}" isn't installed. Run: ollama pull ${model}`);
      loaded = true;
    },
    isLoaded: () => loaded,
    async generate(messages: ChatMessage[], onToken) {
      if (!isLoopbackUrl(url)) throw new Error("Ollama must run on this computer.");
      const res = await fetch(`${base(url)}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true, options: { temperature: 0.2 } }),
      });
      if (!res.ok || !res.body) throw new Error(`Ollama error (${res.status}).`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let out = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const t = (JSON.parse(line) as { message?: { content?: string } }).message?.content ?? "";
          if (t) { out += t; onToken?.(t); }
        }
      }
      return out;
    },
  };
}
