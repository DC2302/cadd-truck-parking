import { promises as fs } from "fs";
import path from "path";
import { SPACES, SpaceStatus, seedStatus } from "@/lib/lot-map";

/**
 * Space inventory storage — same dual backend as acceptance records:
 * Neon Postgres when DATABASE_URL is set (required for real use),
 * else a local JSON file (dev / temporary).
 */

export interface SpaceRecord {
  id: string;
  status: SpaceStatus;
  assignedTo: string;
  confirmation: string;
  note: string;
  updatedAt: string;
}

const FILE_PATH = process.env.VERCEL
  ? path.join("/tmp", "spaces.json")
  : path.join(process.cwd(), "data", "spaces.json");

const VALID: SpaceStatus[] = ["available", "held", "reserved", "maintenance"];

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
    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY,
      sort NUMERIC NOT NULL,
      zone TEXT NOT NULL,
      status TEXT NOT NULL,
      assigned_to TEXT NOT NULL DEFAULT '',
      confirmation TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  const [{ count }] = await sql`SELECT count(*)::int AS count FROM spaces`;
  if (count === 0) {
    for (const s of SPACES) {
      await sql`INSERT INTO spaces (id, sort, zone, status)
        VALUES (${s.id}, ${s.sort}, ${s.zone}, ${seedStatus(s.id)})
        ON CONFLICT (id) DO NOTHING`;
    }
  }
  tableReady = true;
}

/* ── file backend helpers ── */
type FileShape = Record<
  string,
  { status: SpaceStatus; assignedTo: string; confirmation: string; note: string; updatedAt: string }
>;

async function readFileStore(): Promise<FileShape> {
  try {
    return JSON.parse(await fs.readFile(FILE_PATH, "utf8")) as FileShape;
  } catch {
    const seeded: FileShape = {};
    for (const s of SPACES) {
      seeded[s.id] = {
        status: seedStatus(s.id),
        assignedTo: "",
        confirmation: "",
        note: "",
        updatedAt: new Date().toISOString(),
      };
    }
    await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
    await fs.writeFile(FILE_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeFileStore(data: FileShape) {
  await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
}

/* ── public API ── */

export async function listSpaces(): Promise<SpaceRecord[]> {
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    const rows = await sql`SELECT * FROM spaces ORDER BY sort`;
    return rows.map((r) => ({
      id: r.id,
      status: r.status as SpaceStatus,
      assignedTo: r.assigned_to,
      confirmation: r.confirmation,
      note: r.note,
      updatedAt: new Date(r.updated_at).toISOString(),
    }));
  }
  const data = await readFileStore();
  return SPACES.map((s) => ({ id: s.id, ...data[s.id] }));
}

export async function updateSpace(
  id: string,
  patch: Partial<Pick<SpaceRecord, "status" | "assignedTo" | "confirmation" | "note">>,
): Promise<boolean> {
  if (!SPACES.some((s) => s.id === id)) return false;
  if (patch.status && !VALID.includes(patch.status)) return false;

  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    await sql`UPDATE spaces SET
        status = COALESCE(${patch.status ?? null}, status),
        assigned_to = COALESCE(${patch.assignedTo ?? null}, assigned_to),
        confirmation = COALESCE(${patch.confirmation ?? null}, confirmation),
        note = COALESCE(${patch.note ?? null}, note),
        updated_at = now()
      WHERE id = ${id}`;
    return true;
  }
  const data = await readFileStore();
  data[id] = {
    ...data[id],
    ...patch,
    updatedAt: new Date().toISOString(),
  } as FileShape[string];
  await writeFileStore(data);
  return true;
}

/**
 * Auto-assign the lowest-numbered available truck space (RV pads are
 * manual-only). Marks it HELD with the customer's confirmation code —
 * the owner flips it to RESERVED once payment is verified. Returns the
 * space id, or "" if the lot is full.
 */
export async function allocateSpace(
  confirmation: string,
  name: string,
): Promise<string> {
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    const rows = await sql`
      UPDATE spaces SET status = 'held', assigned_to = ${name},
        confirmation = ${confirmation}, updated_at = now()
      WHERE id = (
        SELECT id FROM spaces
        WHERE status = 'available' AND zone <> 'rv'
        ORDER BY sort LIMIT 1
      )
      RETURNING id`;
    return rows[0]?.id ?? "";
  }
  const data = await readFileStore();
  const next = SPACES.filter(
    (s) => s.zone !== "rv" && data[s.id]?.status === "available",
  ).sort((a, b) => a.sort - b.sort)[0];
  if (!next) return "";
  data[next.id] = {
    ...data[next.id],
    status: "held",
    assignedTo: name,
    confirmation,
    updatedAt: new Date().toISOString(),
  };
  await writeFileStore(data);
  return next.id;
}

/**
 * Hold specific customer-picked spaces (all-or-nothing). Returns the held
 * ids, or null if any pick was taken in the meantime — caller should ask
 * the customer to re-pick from a refreshed map.
 */
export async function holdSpaces(
  ids: string[],
  confirmation: string,
  name: string,
): Promise<string[] | null> {
  const wanted = ids.filter(
    (id) => SPACES.some((s) => s.id === id && s.zone !== "rv"),
  );
  if (wanted.length === 0 || wanted.length !== ids.length) return null;

  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    const rows = await sql`
      UPDATE spaces SET status = 'held', assigned_to = ${name},
        confirmation = ${confirmation}, updated_at = now()
      WHERE id = ANY(${wanted}) AND status = 'available'
      RETURNING id`;
    const got = rows.map((r) => r.id as string);
    if (got.length !== wanted.length) {
      // partial grab — release what we took and report the conflict
      if (got.length > 0) {
        await sql`UPDATE spaces SET status = 'available', assigned_to = '',
          confirmation = '', updated_at = now()
          WHERE id = ANY(${got}) AND confirmation = ${confirmation}`;
      }
      return null;
    }
    return got;
  }

  const data = await readFileStore();
  if (!wanted.every((id) => data[id]?.status === "available")) return null;
  for (const id of wanted) {
    data[id] = {
      ...data[id],
      status: "held",
      assignedTo: name,
      confirmation,
      updatedAt: new Date().toISOString(),
    };
  }
  await writeFileStore(data);
  return wanted;
}

/** Availability summary for Big D and the admin header. */
export async function spaceSummary() {
  const all = await listSpaces();
  const trucks = all.filter((s) => !s.id.startsWith("RV"));
  const rvs = all.filter((s) => s.id.startsWith("RV"));
  const avail = trucks.filter((s) => s.status === "available");
  return {
    truckTotal: trucks.length,
    truckAvailable: avail.length,
    nextSpace: avail.sort((a, b) => parseFloat(a.id) - parseFloat(b.id))[0]?.id ?? "",
    rvAvailable: rvs.filter((s) => s.status === "available").length,
    held: all.filter((s) => s.status === "held").length,
  };
}
