# Use Ollama on the laptop for chat and scanned reports

## What changes for you
- **No more AI model download in the chat.** The built-in browser helper (Gemma) is removed. Chat goes straight to Ollama on your laptop (medgemma1.5:4b) and connects by itself.
- **If Ollama isn't running**, the chat shows one short line: "Start Ollama to get friendlier answers." Answers still come straight from your report, so nothing breaks.
- **Scanned reports and photos are read by Ollama** (medgemma can read images). The one-time text-reader download only happens if Ollama isn't available.
- As always, you check the values Ollama reads on the review screen before they're saved, and result status still comes only from the ranges printed on the report.

## Steps
1. Chat: remove the Gemma option and its "Load model" button; Ollama only, auto-connect, plain error messages ("Ollama isn't running", "Model not downloaded — run `ollama pull medgemma1.5:4b`").
2. Scans: send each page image to Ollama, ask it to copy every result line exactly as printed (name, value, unit, range, flag), one per line, and pass them through the existing parser and review screen. Use the current text reader only as a fallback.
3. Update the privacy page and the guided demo text so they mention Ollama instead of the in-browser model.
4. Tests: Ollama image reply is turned into result lines correctly; only localhost addresses are accepted (existing test kept).

## Technical details
- `useLocalModel.ts`: drop gemma branch; `ModelStatus.tsx`: drop download UI. Delete `model/gemma.ts`, `gemma.worker.ts`, `support.ts` if unused.
- `ollama.ts`: add `transcribeImage(url, model, base64)` using `/api/chat` with `images`, `temperature: 0`, `think: false`, loopback-only.
- `extract.ts`: for image files / image-only PDF pages, render to PNG, try Ollama first, else lazy-import tesseract. Output still goes through `parser.ts` and the user review step — the model never sets status or ranges.
- Update AGENTS.md rule for local models (Ollama is the only model path; Ollama also does OCR, with tesseract fallback).
