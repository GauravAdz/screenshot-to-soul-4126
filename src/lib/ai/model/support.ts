import type { SupportReport } from "./types";

interface GPUAdapterLike {
  features: { has(f: string): boolean };
  limits: { maxBufferSize: number };
}

/** Check WebGPU and rough resources. Runs in the browser only. */
export async function detectWebGPU(minBufferMB = 1024): Promise<SupportReport> {
  const reasons: string[] = [];
  const nav = (typeof navigator !== "undefined" ? navigator : {}) as Navigator & {
    gpu?: { requestAdapter(o?: unknown): Promise<GPUAdapterLike | null> };
    deviceMemory?: number;
  };
  const details: SupportReport["details"] = { webgpu: false, shaderF16: false, maxBufferMB: null, deviceMemoryGB: nav.deviceMemory ?? null };
  if (!nav.gpu) {
    reasons.push("This browser can't run the on-device helper. Try a recent Chrome or Edge on a computer.");
    return { supported: false, reasons, details };
  }
  const adapter = await nav.gpu.requestAdapter({ powerPreference: "high-performance" }).catch(() => null);
  if (!adapter) {
    reasons.push("This device's graphics can't run the on-device helper.");
    return { supported: false, reasons, details };
  }
  details.webgpu = true;
  details.shaderF16 = adapter.features.has("shader-f16");
  details.maxBufferMB = Math.round(adapter.limits.maxBufferSize / 1024 / 1024);
  if (!details.shaderF16) reasons.push("This device's graphics can't run the on-device helper.");
  if (details.maxBufferMB < minBufferMB) reasons.push("This device doesn't have enough graphics memory for the on-device helper.");
  if (details.deviceMemoryGB !== null && details.deviceMemoryGB < 4) reasons.push("This device reports less than 4 GB of memory, which is likely too little.");
  return { supported: reasons.length === 0, reasons, details };
}
