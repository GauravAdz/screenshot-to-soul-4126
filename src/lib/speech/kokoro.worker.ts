/// <reference lib="webworker" />
import { installFetchGuard } from "@/lib/ai/model/netguard";
import { progressReporter } from "./worker-client";

installFetchGuard(self as unknown as { fetch: typeof fetch; location: { origin: string } });

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const post = (m: unknown) => (self as unknown as Worker).postMessage(m);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let tts: any = null;

self.onmessage = async (e: MessageEvent) => {
  const m = e.data;
  try {
    if (m.type === "load") {
      if (tts) { post({ type: "loaded" }); return; }
      if (typeof WebAssembly !== "object") throw new Error("This browser can't run the on-device voice.");
      let KokoroTTS: typeof import("kokoro-js").KokoroTTS;
      try {
        ({ KokoroTTS } = await import("kokoro-js"));
      } catch {
        throw new Error("The voice program couldn't load. Check your connection and try again.");
      }
      try {
        tts = await KokoroTTS.from_pretrained(MODEL_ID, {
          dtype: "q8",
          device: "wasm",
          progress_callback: progressReporter(post, "Downloading voice") as never,
        });
      } catch {
        throw new Error("The voice couldn't be downloaded. Check your connection and try again.");
      }
      post({ type: "progress", label: "Voice ready", pct: 100 });
      post({ type: "loaded" });
    } else if (m.type === "run") {
      if (!tts) throw new Error("Voice not loaded");
      try {
        const audio = await tts.generate(m.text, { voice: "af_heart", speed: 1 });
        post({ type: "result", id: m.id, value: audio.toBlob() });
      } catch {
        throw new Error("The voice couldn't read this text aloud.");
      }
    }
  } catch (err) {
    post({ type: "error", id: m.id, message: err instanceof Error ? err.message : String(err) });
  }
};
