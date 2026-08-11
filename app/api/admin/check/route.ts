import { NextResponse } from "next/server";
import { adminKeyDiagnostics, adminPassword, isAdminKey, normalizeKey } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lockout diagnosis: /api/admin/check?try=whatever-you-think-it-is
 *
 * Says whether a candidate is the configured password and, if not, whether
 * the stored value has stray whitespace or quotes around it — the two things
 * that silently reject a correct password.
 *
 * This is not an extra way in and gives away nothing the login page doesn't:
 * it never echoes the password, never reports its length, and answers only
 * about a value the caller already supplied.
 */
export async function GET(req: Request) {
  const candidate = new URL(req.url).searchParams.get("try");
  const diag = adminKeyDiagnostics();

  if (!diag.set) {
    return NextResponse.json(
      {
        ok: false,
        verdict: "no-password-configured",
        detail:
          "ADMIN_PASSWORD is not set on this deployment. Set it in Vercel, then redeploy.",
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  if (candidate === null) {
    return NextResponse.json(
      {
        ok: true,
        verdict: "password-is-configured",
        ...diag,
        detail: diag.hasSurroundingWhitespace
          ? "The stored password has a space or newline around it. Logins are trimmed now, so this should still work."
          : "Add ?try=YOUR-PASSWORD to test a specific one.",
      },
      { headers: { "cache-control": "no-store" } },
    );
  }

  const exact = normalizeKey(candidate) === (process.env.ADMIN_PASSWORD ?? "");
  const matches = isAdminKey(candidate);

  return NextResponse.json(
    {
      ok: true,
      verdict: matches
        ? exact
          ? "match"
          : "match-after-trimming"
        : "no-match",
      ...diag,
      detail: matches
        ? "This is the live password — use it on /admin."
        : "This is not the password on this deployment. Try your other one, or re-set it in Vercel and redeploy.",
      // Confirms which deployment answered, so a stale one is obvious.
      passwordLooksEmpty: adminPassword().length === 0,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
