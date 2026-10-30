<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Patient data never leaves the browser: extraction (pdfjs/tesseract, lazy-imported in src/lib/lab/extract.ts), storage (Dexie + AES-GCM in src/lib/lab/storage.ts) are client-only; no backend or hosted AI for report data. Why: privacy-first requirement.
- Result status comes only from the deterministic engine in src/lib/lab/engine.ts using ranges printed on the report; never invent ranges. Tests in engine.test.ts.
