import { promises as fs } from "fs";
import path from "path";

/**
 * Acceptance-record storage.
 *
 * Every reservation — paid online through Square OR paying by Zelle / Cash App /
 * cash / check — writes one of these records BEFORE the customer is sent to
 * payment. This is your documentation that the customer accepted the Terms.
 *
 * Backend: Neon Postgres when DATABASE_URL is set (recommended in production);
 * otherwise a local JSONL file under data/ (fine for local dev only).
 */

export interface AcceptanceRecord {
  id: string; // confirmation code, e.g. CADD-8F3K2A
  createdAt: string; // ISO timestamp (UTC)
  name: string;
  company: string;
  email: string;
  phone: string;
  vehicle: string; // unit #, plate, length — free text
  plan: string;
  term: string;
  priceUsd: number;
  paymentMethod: string; // "square" | "zelle" | "cashapp" | "cash" | "check" | "other"
  paymentStatus: string; // "sent-to-square" | "pay-on-arrival"
  signature: string; // typed full legal name
  termsVersion: string;
  lang: string; // UI language at acceptance: "en" | "es"
  space: string; // auto-assigned space number ("" = none available)
  ip: string;
  userAgent: string;
}

// On Vercel the project directory is read-only — fall back to /tmp there.
// /tmp is EPHEMERAL (wiped between deployments/instances): set DATABASE_URL
// in production so records are durable.
const FILE_PATH = process.env.VERCEL
  ? path.join("/tmp", "acceptances.jsonl")
  : path.join(process.cwd(), "data", "acceptances.jsonl");

function useDb(): boolean {
  return !!process.env.DATABASE_URL;
}

async function dbSql() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  const sql = await dbSql();
  await sql`
    CREATE TABLE IF NOT EXISTS acceptances (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      vehicle TEXT NOT NULL DEFAULT '',
      plan TEXT NOT NULL,
      term TEXT NOT NULL,
      price_usd NUMERIC NOT NULL,
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      signature TEXT NOT NULL,
      terms_version TEXT NOT NULL,
      lang TEXT NOT NULL DEFAULT 'en',
      space TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT ''
    )`;
  tableReady = true;
}

export async function saveAcceptance(rec: AcceptanceRecord): Promise<void> {
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    await sql`
      INSERT INTO acceptances (
        id, created_at, name, company, email, phone, vehicle, plan, term,
        price_usd, payment_method, payment_status, signature, terms_version,
        lang, space, ip, user_agent
      ) VALUES (
        ${rec.id}, ${rec.createdAt}, ${rec.name}, ${rec.company}, ${rec.email},
        ${rec.phone}, ${rec.vehicle}, ${rec.plan}, ${rec.term}, ${rec.priceUsd},
        ${rec.paymentMethod}, ${rec.paymentStatus}, ${rec.signature},
        ${rec.termsVersion}, ${rec.lang}, ${rec.space}, ${rec.ip}, ${rec.userAgent}
      )`;
    return;
  }
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.appendFile(FILE_PATH, JSON.stringify(rec) + "\n", "utf8");
}

export async function listAcceptances(): Promise<AcceptanceRecord[]> {
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    const rows = await sql`SELECT * FROM acceptances ORDER BY created_at DESC`;
    return rows.map((r) => ({
      id: r.id,
      createdAt: new Date(r.created_at).toISOString(),
      name: r.name,
      company: r.company,
      email: r.email,
      phone: r.phone,
      vehicle: r.vehicle,
      plan: r.plan,
      term: r.term,
      priceUsd: Number(r.price_usd),
      paymentMethod: r.payment_method,
      paymentStatus: r.payment_status,
      signature: r.signature,
      termsVersion: r.terms_version,
      lang: r.lang ?? "en",
      space: r.space ?? "",
      ip: r.ip,
      userAgent: r.user_agent,
    }));
  }
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AcceptanceRecord)
      .reverse();
  } catch {
    return [];
  }
}

export function newConfirmationCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no lookalikes
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `CADD-${code}`;
}
