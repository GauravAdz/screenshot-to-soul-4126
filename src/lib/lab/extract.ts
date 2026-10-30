import type { ExtractedLine } from "./types";

export type Progress = (msg: string, pct: number) => void;

/** Runs fully in the browser. Libraries are loaded lazily; file contents never leave the device. */
export async function extractFile(file: File, onProgress: Progress): Promise<{ lines: ExtractedLine[]; notes: string[] }> {
  const notes: string[] = [];
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractPdf(file, onProgress, notes);
  }
  if (/^image\/(png|jpe?g)$/.test(file.type)) {
    onProgress("Reading the image…", 10);
    const lines = await readImage(file, 1, notes, (p) => onProgress("Reading the image…", 10 + p * 85));
    return { lines, notes };
  }
  throw new Error("Unsupported file type. Please upload a PDF, PNG or JPEG.");
}

async function extractPdf(file: File, onProgress: Progress, notes: string[]) {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines: ExtractedLine[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    onProgress(`Reading page ${p} of ${doc.numPages}…`, (p / doc.numPages) * 90);
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const rows = new Map<number, { x: number; s: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      const x = item.transform[4];
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, s: item.str });
    }
    if (rows.size === 0) {
      // Scanned page: render and OCR locally.
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
      lines.push(...(await readImage(blob, p, notes, (x) => onProgress(`Reading page ${p}…`, ((p - 1 + x) / doc.numPages) * 90))));
      continue;
    }
    [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .forEach(([, items]) => {
        const text = items.sort((a, b) => a.x - b.x).map((i) => i.s).join(" ");
        lines.push({ text, page: p, confidence: null });
      });
  }
  return { lines, notes };
}

/** Tries Ollama on this laptop first; falls back to the in-browser text reader. */
async function readImage(image: Blob, page: number, notes: string[], onP: (p: number) => void): Promise<ExtractedLine[]> {
  try {
    const { getSettings } = await import("@/lib/settings");
    const { transcribeImage } = await import("@/lib/ai/model/ollama");
    const { url, model } = getSettings().ollama;
    onP(0.2);
    const texts = await transcribeImage(url, model, image);
    if (texts.length) {
      notes.push(`Page ${page} was read by Ollama. Please check every value against the report.`);
      return texts.map((text) => ({ text, page, confidence: null }));
    }
  } catch { /* Ollama not available: use the built-in reader */ }
  notes.push(`Page ${page} was read from an image. Please check every value against the report.`);
  return ocr(image, page, onP);
}

async function ocr(image: Blob, page: number, onP: (p: number) => void): Promise<ExtractedLine[]> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") onP(m.progress);
    },
  });
  try {
    const { data } = await worker.recognize(image, {}, { blocks: true });
    const out: ExtractedLine[] = [];
    for (const b of data.blocks ?? [])
      for (const para of b.paragraphs)
        for (const l of para.lines) out.push({ text: l.text.trim(), page, confidence: Math.round(l.confidence) });
    return out;
  } finally {
    await worker.terminate();
  }
}
