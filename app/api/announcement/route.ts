import { NextResponse } from "next/server";
import { visibleNow } from "@/lib/announcements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public — the message running right now, or nothing.
 *
 * A failed lookup must NOT look like an empty one. Returning
 * {ok:true, announcement:null} on error is indistinguishable from an
 * unpublished week, which makes "why isn't the banner showing" impossible to
 * answer from outside. Errors say so and log the cause.
 */
export async function GET() {
  try {
    const { announcement, reason, isDefault } = await visibleNow();
    return NextResponse.json(
      { ok: true, announcement, isDefault: !!isDefault, reason },
      {
        headers: {
          "cache-control": "public, s-maxage=60, stale-while-revalidate=600",
        },
      },
    );
  } catch (e) {
    console.error("[announcement] lookup failed:", e);
    return NextResponse.json(
      { ok: false, error: "Announcement lookup failed." },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  }
}
