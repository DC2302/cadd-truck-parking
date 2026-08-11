import { timingSafeEqual } from "crypto";

/**
 * One place that decides whether a request is the owner.
 *
 * This used to be `key === process.env.ADMIN_PASSWORD` copied into seven
 * files. Two things made that fragile enough to lock the owner out:
 *
 *  - No trimming. Pasting a password into the Vercel dashboard very easily
 *    picks up a trailing space or newline, and a strict === then rejects the
 *    correct password with no explanation at all.
 *  - Seven copies. Any fix had to be made seven times.
 *
 * The key may arrive as ?key= (kept, so existing bookmarks work), an
 * x-admin-key header, or a JSON body field — the last two keep the password
 * out of the URL, and therefore out of browser history and server logs.
 */

/** Trim, and also strip quotes someone may have pasted around the value. */
export function normalizeKey(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

/** Constant-time compare so the endpoint isn't a character-by-character oracle. */
function sameSecret(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

export function adminPassword(): string {
  return normalizeKey(process.env.ADMIN_PASSWORD);
}

export function isAdminKey(candidate: string | null | undefined): boolean {
  const pass = adminPassword();
  if (!pass) return false;
  return sameSecret(normalizeKey(candidate), pass);
}

/** Pull the key from a request: query string, header, or already-parsed body. */
export function keyFromRequest(req: Request, body?: unknown): string {
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("key");
  if (fromQuery) return fromQuery;
  const fromHeader = req.headers.get("x-admin-key");
  if (fromHeader) return fromHeader;
  if (body && typeof body === "object" && "key" in body) {
    return String((body as { key?: unknown }).key ?? "");
  }
  return "";
}

export function authorizeRequest(req: Request, body?: unknown): boolean {
  return isAdminKey(keyFromRequest(req, body));
}

/**
 * Non-secret facts about the configured password, for diagnosing a lockout.
 *
 * Deliberately reveals nothing an attacker can use: no value, no length, no
 * hash. Just whether one is set at all and whether the stored value has
 * surrounding whitespace — which is the thing that silently breaks logins.
 */
export function adminKeyDiagnostics() {
  const raw = process.env.ADMIN_PASSWORD;
  const set = typeof raw === "string" && raw.length > 0;
  return {
    set,
    hasSurroundingWhitespace: set ? raw !== raw.trim() : false,
    hasWrappingQuotes: set ? /^["'].*["']$/.test(raw.trim()) : false,
  };
}
