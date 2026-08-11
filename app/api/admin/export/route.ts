import { isAdminKey } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { listAcceptances } from "@/lib/store";

export const runtime = "nodejs";

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
    if (!isAdminKey(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await listAcceptances();
  const header = [
    "confirmation",
    "created_at_utc",
    "name",
    "company",
    "email",
    "phone",
    "vehicle",
    "plan",
    "term",
    "price_usd",
    "payment_method",
    "payment_status",
    "signature",
    "terms_version",
    "lang",
    "space",
    "ip",
    "user_agent",
  ];
  const rows = records.map((r) =>
    [
      r.id,
      r.createdAt,
      r.name,
      r.company,
      r.email,
      r.phone,
      r.vehicle,
      r.plan,
      r.term,
      r.priceUsd,
      r.paymentMethod,
      r.paymentStatus,
      r.signature,
      r.termsVersion,
      r.lang ?? "en",
      r.space ?? "",
      r.ip,
      r.userAgent,
    ]
      .map(csvEscape)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cadd-acceptances-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
