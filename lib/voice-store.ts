import { promises as fs } from "fs";
import path from "path";

/** Per-call conversation memory for the phone agent, keyed by Twilio
 *  CallSid. Neon when DATABASE_URL is set, else a local JSON file. */

export interface VoiceMsg {
  role: "user" | "assistant";
  content: string;
}

const FILE_PATH = process.env.VERCEL
  ? path.join("/tmp", "voice-sessions.json")
  : path.join(process.cwd(), "data", "voice-sessions.json");

function useDb(): boolean {
  return !!process.env.DATABASE_URL;
}

async function dbSql() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

let ready = false;
async function ensureTable() {
  if (ready) return;
  const sql = await dbSql();
  await sql`
    CREATE TABLE IF NOT EXISTS voice_sessions (
      call_sid TEXT PRIMARY KEY,
      messages JSONB NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  ready = true;
}

export async function getVoiceSession(callSid: string): Promise<VoiceMsg[]> {
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    const rows = await sql`SELECT messages FROM voice_sessions WHERE call_sid = ${callSid}`;
    return (rows[0]?.messages as VoiceMsg[]) ?? [];
  }
  try {
    const data = JSON.parse(await fs.readFile(FILE_PATH, "utf8"));
    return data[callSid] ?? [];
  } catch {
    return [];
  }
}

export async function saveVoiceSession(
  callSid: string,
  messages: VoiceMsg[],
): Promise<void> {
  const trimmed = messages.slice(-16); // keep calls cheap
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    await sql`INSERT INTO voice_sessions (call_sid, messages, updated_at)
      VALUES (${callSid}, ${JSON.stringify(trimmed)}, now())
      ON CONFLICT (call_sid) DO UPDATE SET messages = ${JSON.stringify(trimmed)}, updated_at = now()`;
    return;
  }
  let data: Record<string, VoiceMsg[]> = {};
  try {
    data = JSON.parse(await fs.readFile(FILE_PATH, "utf8"));
  } catch {}
  data[callSid] = trimmed;
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(data));
}
