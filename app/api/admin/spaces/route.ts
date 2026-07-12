import { NextRequest, NextResponse } from "next/server";
import { listSpaces, updateSpace, spaceSummary } from "@/lib/spaces-store";

export const runtime = "nodejs";

function authorized(req: NextRequest): boolean {
  const key =
    req.nextUrl.searchParams.get("key") ||
    req.headers.get("x-admin-key") ||
    "";
  const pass = process.env.ADMIN_PASSWORD;
  return !!pass && key === pass;
}

/** Full inventory (statuses + who holds what). */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [spaces, summary] = await Promise.all([listSpaces(), spaceSummary()]);
  return NextResponse.json({ spaces, summary, persistent: !!process.env.DATABASE_URL });
}

/** Update one space: { id, status?, assignedTo?, confirmation?, note? } */
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const patch: Record<string, string> = {};
  for (const k of ["status", "assignedTo", "confirmation", "note"] as const) {
    if (typeof body[k] === "string") patch[k] = (body[k] as string).slice(0, 200);
  }
  const ok = await updateSpace(id, patch);
  if (!ok) {
    return NextResponse.json({ error: "Unknown space or bad status" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, summary: await spaceSummary() });
}
