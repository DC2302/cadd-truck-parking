import { NextResponse } from "next/server";
import {
  listAnnouncements,
  publishAnnouncement,
  saveAnnouncement,
  setAnnouncementStatus,
  visibleNow,
} from "@/lib/announcements";
import { THEMES, ThemeId, mondayOf } from "@/lib/announcements-types";
import { draftAnnouncement } from "@/lib/announcement-writer";
import { authorizeRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Same `?key=` gate the rest of the admin uses. */
const authorized = (req: Request, body?: unknown) => authorizeRequest(req, body);

const denied = () =>
  NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });

/** Which database this runtime writes to — host only, never credentials. */
function dbFingerprint() {
  const url = process.env.DATABASE_URL;
  if (!url) return { backend: "file" as const };
  try {
    return { backend: "neon" as const, host: new URL(url).hostname };
  } catch {
    return { backend: "neon" as const, host: "unparseable" };
  }
}

export async function GET(req: Request) {
  if (!authorized(req)) return denied();
  const showing = await visibleNow();
  return NextResponse.json({
    ok: true,
    announcements: await listAnnouncements(),
    thisWeek: mondayOf(),
    liveId: showing.announcement?.id ?? null,
    notLiveReason: showing.reason ?? null,
    isDefault: !!showing.isDefault,
    themes: THEMES,
    writerReady: !!process.env.ANTHROPIC_API_KEY,
    db: dbFingerprint(),
  });
}

export async function POST(req: Request) {
  if (!authorized(req)) return denied();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request body." },
      { status: 400 },
    );
  }

  // Draft only — writes nothing, so the owner always reviews before saving.
  if (body.action === "draft") {
    const request = String(body.request ?? "").trim();
    if (request.length < 8)
      return NextResponse.json(
        { ok: false, error: "Tell it what you want to say — a sentence is plenty." },
        { status: 400 },
      );
    const out = await draftAnnouncement(
      request,
      (body.theme as ThemeId) || undefined,
    );
    return NextResponse.json({ ok: true, ...out });
  }

  const by = String(body.by ?? "").trim() || "CADD";

  if (body.action === "publish" || body.action === "archive") {
    const id = String(body.id ?? "");
    if (!id)
      return NextResponse.json(
        { ok: false, error: "Missing id." },
        { status: 400 },
      );
    const doc =
      body.action === "publish"
        ? await publishAnnouncement(id, by)
        : await setAnnouncementStatus(id, "archived");
    if (!doc)
      return NextResponse.json(
        { ok: false, error: "Announcement not found." },
        { status: 404 },
      );
    const after = await visibleNow();
    return NextResponse.json({
      ok: true,
      announcement: doc,
      announcements: await listAnnouncements(),
      liveId: after.announcement?.id ?? null,
      notLiveReason: after.reason ?? null,
      isDefault: !!after.isDefault,
    });
  }

  const headline = body.headline as { en?: string } | undefined;
  if (!headline?.en?.trim())
    return NextResponse.json(
      { ok: false, error: "The banner needs an English headline." },
      { status: 400 },
    );

  const saved = await saveAnnouncement({ ...body, by });
  const state = await visibleNow();
  return NextResponse.json({
    ok: true,
    announcement: saved,
    announcements: await listAnnouncements(),
    liveId: state.announcement?.id ?? null,
    notLiveReason: state.reason ?? null,
    isDefault: !!state.isDefault,
  });
}
