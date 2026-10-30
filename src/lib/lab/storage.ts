import Dexie, { type Table } from "dexie";
import type { LabReport } from "./types";

interface EncryptedRow {
  id: string;
  createdAt: number;
  iv: Uint8Array;
  cipher: ArrayBuffer;
}
interface KeyRow {
  id: string;
  key: CryptoKey;
}

class LabDB extends Dexie {
  reports!: Table<EncryptedRow, string>;
  keys!: Table<KeyRow, string>;
  constructor() {
    super("lab-explainer");
    this.version(1).stores({ reports: "id, createdAt", keys: "id" });
  }
}

let db: LabDB | null = null;
const getDb = () => (db ??= new LabDB());

/** Non-extractable AES-GCM key generated and kept on this device only. */
async function getKey(): Promise<CryptoKey> {
  const existing = await getDb().keys.get("main");
  if (existing) return existing.key;
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await getDb().keys.put({ id: "main", key });
  return key;
}

export async function saveReport(report: LabReport) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(report)));
  await getDb().reports.put({ id: report.id, createdAt: report.createdAt, iv, cipher });
}

async function decrypt(row: EncryptedRow): Promise<LabReport> {
  const key = await getKey();
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: row.iv as BufferSource }, key, row.cipher);
  return JSON.parse(new TextDecoder().decode(plain));
}

export async function getReport(id: string) {
  const row = await getDb().reports.get(id);
  return row ? decrypt(row) : null;
}

export async function listReports(): Promise<LabReport[]> {
  const rows = await getDb().reports.orderBy("createdAt").reverse().toArray();
  return Promise.all(rows.map(decrypt));
}

export const deleteReport = (id: string) => getDb().reports.delete(id);

export function exportReport(r: LabReport) {
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${r.title.replace(/[^\w-]+/g, "_") || "lab-report"}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
