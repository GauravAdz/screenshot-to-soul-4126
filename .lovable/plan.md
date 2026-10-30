# Simpler, more visual ClearLab + working local voice

Keeps OCR, encrypted local storage, sourced Q&A, Gemma, validation and privacy as they are.

## 1. Fix local voice (priority)
- Cause: the voice worker loads Kokoro from a hardcoded `node_modules` path, which breaks in the preview and in published builds.
- Import Kokoro's browser build through a package path Vite bundles (alias to `kokoro-js/dist/kokoro.web.js`, which avoids the earlier phonemizer error), load only on first Listen, WASM + q8, cached in the worker.
- Separate error messages: browser unsupported (WebAssembly), model download failed, voice failed to load, playback failed. Compact "Downloading voice…" progress and a Retry button.
- Text always stays readable; no automatic cloud fallback.
- Verify real audio synthesis (non-empty audio samples from synthetic text) in dev and in a production build preview.

## 2. Plain language
- Labels: "Unknown" -> "Can't tell from this report"; "need checking" split into "couldn't be read" vs "no lab range to compare"; "Explain this result" -> "What does this mean?"; "What it measures & trend" -> "More details"; upload notice -> "N lines need another look".
- Remove internal terms (OCR, parsing, retrieval, confidence, model) from patient-facing text; keep critical lab flags clearly visible.

## 3. Report page redesign
- Small visual overview: within / outside / can't compare counts, critical alert if any, short disclaimer.
- Results in one vertical column on all screens, with soft sketch-style cards: friendly icon, name, value + unit, status pill, small range bar (only if comparable), one-line "what it checks", actions "What does this mean?" and "Listen".
- "More details": original name, printed range, source page, uncertainties, trend chart.
- Remove the long footer disclaimer; use the new one-line disclaimer in the overview and site footer.

## 4. Friendlier chat answers
- Lead with a 2–4 sentence plain answer; "Tell me more" reveals your values, sources, doctor questions.
- Smaller bubbles, follow-up chips, no repeated disclaimers. Facts still come only from the report.

## Technical details
- Files: `kokoro.worker.ts`, `vite.config.ts`, `player.ts`, `VoicePlayer.tsx`, `engine.ts` (STATUS_LABEL), `ResultCard.tsx`, `ReportOverview.tsx`, `report.$id.tsx`, `upload.tsx`, `AnswerView.tsx`, `answer.ts` summary wording, `__root.tsx` footer.
- Update tests that assert labels; run the full vitest suite and a Playwright check of upload -> report -> chat -> Listen.
