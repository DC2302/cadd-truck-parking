import { isAdminKey } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/square-subscriptions";

export const runtime = "nodejs";

function base(): string {
  return process.env.SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}
function headers() {
  return {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2025-05-21",
  };
}

/**
 * Diagnostic + light management for Square subscriptions.
 *   GET ?key=ADMIN_PASSWORD              → list this location's subscriptions
 *   GET ?key=ADMIN_PASSWORD&cancel=<id>  → cancel one subscription
 */
export async function GET(req: NextRequest) {
  if (!isAdminKey(req.nextUrl.searchParams.get("key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cancelId = req.nextUrl.searchParams.get("cancel");
  if (cancelId) {
    try {
      const r = await cancelSubscription(cancelId);
      const sub = r.subscription as { id?: string; status?: string } | undefined;
      return NextResponse.json({
        ok: true,
        canceled: sub?.id ?? cancelId,
        status: sub?.status,
      });
    } catch (e) {
      return NextResponse.json(
        { ok: false, error: e instanceof Error ? e.message : String(e) },
        { status: 502 },
      );
    }
  }

  try {
    const res = await fetch(`${base()}/v2/subscriptions/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        query: { filter: { location_ids: [process.env.SQUARE_LOCATION_ID] } },
      }),
    });
    const json = (await res.json()) as {
      subscriptions?: Record<string, unknown>[];
    };
    const subs = (json.subscriptions ?? []).map((s) => ({
      id: s.id,
      status: s.status,
      plan_variation_id: s.plan_variation_id,
      customer_id: s.customer_id,
      created_at: s.created_at,
    }));
    return NextResponse.json({ ok: res.ok, count: subs.length, subscriptions: subs });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
