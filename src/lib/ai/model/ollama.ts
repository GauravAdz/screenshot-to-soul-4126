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
      let models: string[];
      try { models = await listOllamaModels(url); } catch { throw new Error("Ollama isn't running."); }
      if (!models.some((m) => m === model || m === `${model}:latest`)) throw new Error(`Model not downloaded — run: ollama pull ${model}`);
      loaded = true;
    },
    isLoaded: () => loaded,
    async generate(messages: ChatMessage[], onToken) {
      if (!isLoopbackUrl(url)) throw new Error("Ollama must run on this computer.");
      const res = await fetch(`${base(url)}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, stream: true, think: false, options: { temperature: 0.1, top_p: 0.8, repeat_penalty: 1.15, num_predict: 220, num_ctx: 4096 } }),
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

/** Turns an Ollama transcription reply into plain lines (drops markdown, bullets, empty lines). */
export function replyToLines(reply: string): string[] {
  return reply
    .replace(/<think>[\s\S]*?(<\/think>|$)/gi, "")
    .split("\n")
    .map((l) => l.replace(/^\s*([-*•]|\d+[.)])\s+/, "").replace(/[*`#]+/g, "").replace(/\s*\|\s*/g, " ").trim())
    .filter((l) => l && !/^-{3,}$/.test(l));
}

/** Asks local Ollama to copy the result lines from a page image exactly as printed. */
export async function transcribeImage(url: string, model: string, image: Blob): Promise<string[]> {
  if (!isLoopbackUrl(url)) throw new Error("Ollama must run on this computer.");
  const bytes = new Uint8Array(await image.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const res = await fetch(`${base(url)}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model, stream: false, think: false, options: { temperature: 0 },
      messages: [{
        role: "user",
        images: [btoa(bin)],
        content: "Copy every lab test result line from this report image exactly as printed: test name, value, unit, reference range and any flag (H, L, HH, LL). One result per line, plain text, no extra words. Do not calculate, interpret or add anything not printed.",
      }],
    }),
  });
  if (!res.ok) throw new Error(`Ollama error (${res.status}).`);
  const data = (await res.json()) as { message?: { content?: string } };
  return replyToLines(data.message?.content ?? "");
}
