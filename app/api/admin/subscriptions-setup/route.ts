import { NextRequest, NextResponse } from "next/server";
import { PLANS, TermId } from "@/lib/pricing";
import { ensurePlanVariation } from "@/lib/square-subscriptions";

export const runtime = "nodejs";

/**
 * One-time (idempotent) provisioning of the Square catalog subscription plans
 * for every Monthly / Annual plan. Safe to re-run — ensurePlanVariation matches
 * existing catalog objects by name before creating.
 *
 * GET /api/admin/subscriptions-setup?key=ADMIN_PASSWORD
 */
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("key") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recurringTerms: TermId[] = ["monthly", "annual"];
  const result: Record<string, string> = {};
  const errors: Record<string, string> = {};

  for (const plan of PLANS) {
    for (const term of recurringTerms) {
      const key = `${plan.id}:${term}`;
      try {
        result[key] = await ensurePlanVariation(plan.id, term);
      } catch (e) {
        errors[key] = e instanceof Error ? e.message : String(e);
      }
    }
  }

  return NextResponse.json({
    ok: Object.keys(errors).length === 0,
    planVariations: result,
    errors,
  });
}
