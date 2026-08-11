import { promises as fs } from "fs";
import path from "path";
import {
  Announcement,
  Bi,
  LIMITS,
  clampBi,
  clampText,
  isStale,
  mondayOf,
  mondayOfYmd,
  themeById,
  todayYmd,
} from "@/lib/announcements-types";
import { defaultAnnouncement } from "@/lib/announcement-default";

/**
 * Weekly announcement storage — same dual backend as acceptance records and
 * space inventory: Neon Postgres when DATABASE_URL is set, else a local JSON
 * file for dev.
 *
 * One published announcement runs at a time. The newest week that has already
 * started wins, so scheduling next month's message never blanks this week's.
 */

const FILE_PATH = process.env.VERCEL
  ? path.join("/tmp", "announcements.json")
  : path.join(process.cwd(), "data", "announcements.json");

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
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      week_of TEXT NOT NULL,
      status TEXT NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )`;
  tableReady = true;
}

/* ── file backend ── */

async function fileRead(): Promise<Announcement[]> {
  try {
    return JSON.parse(await fs.readFile(FILE_PATH, "utf8")) as Announcement[];
  } catch {
    return [];
  }
}

async function fileWrite(rows: Announcement[]) {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(rows, null, 2), "utf8");
}

/* ── public API ── */

export async function listAnnouncements(): Promise<Announcement[]> {
  const rows = useDb()
    ? await (async () => {
        await ensureTable();
        const sql = await dbSql();
        const r = (await sql`SELECT data FROM announcements`) as {
          data: Announcement;
        }[];
        return r.map((x) => x.data);
      })()
    : await fileRead();
  return rows.sort((a, b) =>
    `${b.weekOf}${b.createdAt}`.localeCompare(`${a.weekOf}${a.createdAt}`),
  );
}

async function upsert(doc: Announcement) {
  if (useDb()) {
    await ensureTable();
    const sql = await dbSql();
    await sql`
      INSERT INTO announcements (id, week_of, status, data, created_at)
      VALUES (${doc.id}, ${doc.weekOf}, ${doc.status}, ${JSON.stringify(doc)}::jsonb, ${doc.createdAt})
      ON CONFLICT (id) DO UPDATE
        SET week_of = EXCLUDED.week_of,
            status  = EXCLUDED.status,
            data    = EXCLUDED.data`;
    return;
  }
  const rows = await fileRead();
  const i = rows.findIndex((r) => r.id === doc.id);
  if (i >= 0) rows[i] = doc;
  else rows.push(doc);
  await fileWrite(rows);
}

async function byId(id: string): Promise<Announcement | null> {
  return (await listAnnouncements()).find((a) => a.id === id) ?? null;
}

/** Normalize anything on its way into storage — composer and writer both use it. */
export function cleanAnnouncement(raw: Partial<Announcement>) {
  const facts = (Array.isArray(raw.facts) ? raw.facts : [])
    .map((f) => clampBi(f, LIMITS.fact))
    .filter((f) => f.en || f.es)
    .slice(0, LIMITS.facts);

  const href = String(raw.cta?.href ?? "").trim();
  // Our own pages and tel: links only — a banner is not a place to send
  // drivers somewhere unvetted.
  const safeHref = /^(\/[\w\-/#?=&.]*|tel:\+?[\d-]+)$/.test(href) ? href : "";
  const label = clampBi(raw.cta?.label, 28);

  return {
    theme: themeById(raw.theme).id,
    kicker: clampBi(raw.kicker, LIMITS.kicker),
    headline: clampBi(raw.headline, LIMITS.headline),
    body: clampBi(raw.body, LIMITS.body),
    facts,
    cta: safeHref && (label.en || label.es) ? { label, href: safeHref } : null,
  };
}

const newId = () =>
  `ann_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export async function saveAnnouncement(
  input: Partial<Announcement> & { by: string },
): Promise<Announcement> {
  const existing = input.id ? await byId(input.id) : null;
  const doc: Announcement = {
    id: existing?.id ?? newId(),
    // The field is labelled "week of", so snap whatever date was picked to
    // that week's Monday. A date one day out would otherwise read as a
    // future week and hide the banner with no explanation.
    weekOf: /^\d{4}-\d{2}-\d{2}$/.test(String(input.weekOf))
      ? mondayOfYmd(String(input.weekOf))
      : mondayOf(),
    status: existing?.status ?? "draft",
    request: clampText(input.request ?? existing?.request, LIMITS.request),
    createdBy: existing?.createdBy ?? input.by,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    publishedAt: existing?.publishedAt,
    ...cleanAnnouncement(input),
  };
  await upsert(doc);
  return doc;
}

export async function publishAnnouncement(
  id: string,
  by: string,
): Promise<Announcement | null> {
  const doc = await byId(id);
  if (!doc) return null;
  // Only retire what this actually replaces. Scheduling a future message must
  // not take the current one down in the meantime.
  if (mondayOfYmd(doc.weekOf) <= todayYmd()) {
    for (const other of await listAnnouncements()) {
      if (
        other.id !== id &&
        other.status === "published" &&
        other.weekOf <= doc.weekOf
      ) {
        await upsert({ ...other, status: "archived" });
      }
    }
  }
  const next: Announcement = {
    ...doc,
    status: "published",
    publishedAt: new Date().toISOString(),
    createdBy: doc.createdBy || by,
  };
  await upsert(next);
  return next;
}

export async function setAnnouncementStatus(
  id: string,
  status: Announcement["status"],
): Promise<Announcement | null> {
  const doc = await byId(id);
  if (!doc) return null;
  const next = { ...doc, status };
  await upsert(next);
  return next;
}

/**
 * What the site shows, and when it isn't a published one, why.
 *
 * "Published" and "actually on the site" are different states, and a publish
 * that quietly does nothing is the worst kind of bug — so the reason always
 * comes back with the answer.
 */
export async function visibleNow(): Promise<{
  announcement: Announcement | null;
  reason?: string;
  isDefault?: boolean;
}> {
  const today = todayYmd();
  const published = (await listAnnouncements()).filter(
    (a) => a.status === "published",
  );

  const live = published.filter((a) => a.weekOf <= today && !isStale(a.weekOf));
  if (live.length) return { announcement: live[0] };

  const fallback = defaultAnnouncement(today);
  const why = !published.length
    ? "Nothing has been published from the admin."
    : published[0].weekOf > today
      ? `The newest published one is dated ${published[0].weekOf}, which hasn't started yet.`
      : `The last published one ran the week of ${published[0].weekOf} and has aged out.`;

  if (fallback) {
    return {
      announcement: fallback,
      isDefault: true,
      reason: `${why} Showing the built-in message — publish one to replace it.`,
    };
  }
  return { announcement: null, reason: why };
}

export type { Announcement, Bi };
