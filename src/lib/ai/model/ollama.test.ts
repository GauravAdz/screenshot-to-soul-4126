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
