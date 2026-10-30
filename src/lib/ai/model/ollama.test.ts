import { describe, expect, it } from "vitest";
import { isLoopbackUrl } from "./ollama";

describe("Ollama is limited to this computer", () => {
  it("allows localhost addresses", () => {
    expect(isLoopbackUrl("http://localhost:11434")).toBe(true);
    expect(isLoopbackUrl("http://127.0.0.1:11434")).toBe(true);
  });
  it("rejects remote servers", () => {
    expect(isLoopbackUrl("http://192.168.1.20:11434")).toBe(false);
    expect(isLoopbackUrl("https://ollama.example.com")).toBe(false);
    expect(isLoopbackUrl("http://localhost.evil.com")).toBe(false);
  });
});

import { replyToLines } from "./ollama";
describe("replyToLines", () => {
  it("turns an Ollama transcription into clean result lines", () => {
    expect(replyToLines("<think>x</think>- **Hemoglobin** 13.5 g/dL 12.0-16.0\n\n2. Glucose | 110 | mg/dL | 70-99 | H\n---")).toEqual([
      "Hemoglobin 13.5 g/dL 12.0-16.0",
      "Glucose 110 mg/dL 70-99 H",
    ]);
  });
});
