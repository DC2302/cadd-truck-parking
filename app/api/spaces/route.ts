import { NextResponse } from "next/server";
import { listSpaces, spaceSummary } from "@/lib/spaces-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public availability feed for the booking map — statuses only,
 *  never customer names or confirmation codes. */
export async function GET() {
  const [spaces, summary] = await Promise.all([listSpaces(), spaceSummary()]);
  return NextResponse.json(
    {
      statuses: Object.fromEntries(spaces.map((s) => [s.id, s.status])),
      available: summary.truckAvailable,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
