import { isAdminKey } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Admin diagnostic: verifies the Square credentials without ever exposing
 * them. Tries the token against both Square environments and lists the
 * account's locations (id + name only) so SQUARE_LOCATION_ID can be set
 * correctly. GET /api/admin/square-check?key=<ADMIN_PASSWORD>
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
    if (!isAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ configured: false, error: "SQUARE_ACCESS_TOKEN not set" });
  }

  const bases: Record<string, string> = {
    production: "https://connect.squareup.com",
    sandbox: "https://connect.squareupsandbox.com",
  };

  const results: Record<string, unknown> = {
    envSetting: process.env.SQUARE_ENV || "(unset)",
    locationIdSetting: process.env.SQUARE_LOCATION_ID || "(unset)",
  };

  for (const [envName, base] of Object.entries(bases)) {
    try {
      const res = await fetch(`${base}/v2/locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Square-Version": "2025-05-21",
        },
      });
      const json = await res.json();
      results[envName] = res.ok
        ? {
            ok: true,
            locations: (json.locations || []).map(
              (l: { id: string; name: string; status: string }) => ({
                id: l.id,
                name: l.name,
                status: l.status,
              }),
            ),
          }
        : { ok: false, status: res.status, errors: json.errors };
    } catch (e) {
      results[envName] = { ok: false, error: String(e) };
    }
  }

  return NextResponse.json(results);
}
