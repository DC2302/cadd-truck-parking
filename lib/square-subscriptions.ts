/**
 * Square Subscriptions — recurring billing for Monthly / Annual plans.
 *
 * Option A (invoice-based): we create a Square Customer and a Subscription with
 * NO card on file, so Square emails the customer their first invoice. When they
 * pay it they can save a card, and Square then auto-charges every following
 * period on its own. Cancel or pause any subscription from the Square Dashboard.
 *
 * Daily / Weekly stay one-time (see lib/square.ts). Only Monthly / Annual route
 * here.
 */

import { getPlan, TermId } from "@/lib/pricing";

const API_VERSION = "2025-05-21";

function base(): string {
  return process.env.SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function headers() {
  return {
    Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": API_VERSION,
  };
}

async function sq(
  path: string,
  body?: unknown,
  method: "GET" | "POST" = "POST",
): Promise<Record<string, unknown>> {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Square ${method} ${path} ${res.status}: ${text}`);
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

/** Terms that bill on a repeating cadence rather than once. */
export function isRecurringTerm(term: string): boolean {
  return term === "monthly" || term === "annual";
}

const CADENCE: Record<string, string> = {
  monthly: "MONTHLY",
  annual: "ANNUAL",
};

// Stable, human-readable catalog names — also our idempotency key by lookup.
function planCatalogName(planLabel: string): string {
  return `CADD ${planLabel}`;
}
function variationCatalogName(planLabel: string, term: string): string {
  return `${planLabel} ${term === "annual" ? "Annual" : "Monthly"}`;
}

// Warm-invocation cache: "planId:term" -> plan_variation_id
const variationCache = new Map<string, string>();

/** Read every subscription plan + variation once, indexed by name. */
async function loadCatalog(): Promise<{
  plans: Map<string, string>;
  variations: Map<string, string>;
}> {
  const j = await sq(
    "/v2/catalog/list?types=SUBSCRIPTION_PLAN,SUBSCRIPTION_PLAN_VARIATION",
    undefined,
    "GET",
  );
  const objects = (j.objects as Record<string, unknown>[] | undefined) ?? [];
  const plans = new Map<string, string>();
  const variations = new Map<string, string>();
  for (const o of objects) {
    if (o.type === "SUBSCRIPTION_PLAN") {
      const d = o.subscription_plan_data as { name?: string } | undefined;
      if (d?.name) plans.set(d.name, o.id as string);
    } else if (o.type === "SUBSCRIPTION_PLAN_VARIATION") {
      const d = o.subscription_plan_variation_data as
        | { name?: string }
        | undefined;
      if (d?.name) variations.set(d.name, o.id as string);
    }
  }
  return { plans, variations };
}

/**
 * Look up — or create — the Square catalog plan variation for a plan/term.
 * Idempotent: matches existing catalog objects by name before creating, so it
 * is safe to call on every booking and safe to re-run during setup.
 */
export async function ensurePlanVariation(
  planId: string,
  term: TermId,
): Promise<string> {
  const cacheKey = `${planId}:${term}`;
  const cached = variationCache.get(cacheKey);
  if (cached) return cached;

  const plan = getPlan(planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  const amountUsd = plan.prices[term];
  if (amountUsd === undefined) throw new Error(`No price for ${planId}/${term}`);

  const pName = planCatalogName(plan.name);
  const vName = variationCatalogName(plan.name, term);

  const { plans, variations } = await loadCatalog();

  // Existing variation? Use it.
  const existingVar = variations.get(vName);
  if (existingVar) {
    variationCache.set(cacheKey, existingVar);
    return existingVar;
  }

  // Ensure the parent plan exists.
  let planRealId = plans.get(pName);
  if (!planRealId) {
    const r = await sq("/v2/catalog/object", {
      idempotency_key: crypto.randomUUID(),
      object: {
        type: "SUBSCRIPTION_PLAN",
        id: "#plan",
        subscription_plan_data: { name: pName },
      },
    });
    planRealId = (r.catalog_object as { id: string }).id;
  }

  // Create the variation with a single, indefinite static-price phase.
  const rv = await sq("/v2/catalog/object", {
    idempotency_key: crypto.randomUUID(),
    object: {
      type: "SUBSCRIPTION_PLAN_VARIATION",
      id: "#variation",
      subscription_plan_variation_data: {
        name: vName,
        subscription_plan_id: planRealId,
        phases: [
          {
            ordinal: 0,
            cadence: CADENCE[term],
            pricing: {
              type: "STATIC",
              price: { amount: Math.round(amountUsd * 100), currency: "USD" },
            },
          },
        ],
      },
    },
  });
  const variationId = (rv.catalog_object as { id: string }).id;
  variationCache.set(cacheKey, variationId);
  return variationId;
}

function e164(phone: string): string | undefined {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return d ? `+${d}` : undefined;
}

export interface SubscriptionResult {
  subscriptionId?: string;
  customerId: string;
  variationId: string;
  status?: string;
  cardId?: string;
  /** True when a card was saved on file, so billing auto-charges by default. */
  autoCharge: boolean;
}

/** Store a card on file for a customer from a Web Payments SDK token. */
async function createCardOnFile(
  customerId: string,
  cardToken: string,
): Promise<string> {
  const r = await sq("/v2/cards", {
    idempotency_key: crypto.randomUUID(),
    source_id: cardToken,
    card: { customer_id: customerId },
  });
  return (r.card as { id: string }).id;
}

/**
 * Create a recurring subscription for a Monthly / Annual booking.
 *
 * With `cardToken` (Option B): we store the card on file and attach it to the
 * subscription (card_id), so Square charges the first period now and
 * auto-charges every following period by default — no customer action needed.
 *
 * Without `cardToken` (Option A): no card is supplied, so Square emails the
 * customer their first invoice instead.
 */
export async function createSubscription(opts: {
  plan: string;
  term: TermId;
  name: string;
  company?: string;
  email: string;
  phone: string;
  confirmationCode: string;
  cardToken?: string;
}): Promise<SubscriptionResult> {
  const variationId = await ensurePlanVariation(opts.plan, opts.term);

  const parts = opts.name.trim().split(/\s+/);
  const given = parts[0] || opts.name;
  const family = parts.slice(1).join(" ") || undefined;

  const cust = await sq("/v2/customers", {
    idempotency_key: crypto.randomUUID(),
    given_name: given,
    family_name: family,
    email_address: opts.email,
    phone_number: e164(opts.phone),
    company_name: opts.company || undefined,
    reference_id: opts.confirmationCode,
    note: `CADD ${opts.plan} ${opts.term} — ${opts.confirmationCode}`,
  });
  const customerId = (cust.customer as { id: string }).id;

  // Option B: save the card so the subscription auto-charges by default.
  let cardId: string | undefined;
  if (opts.cardToken) {
    cardId = await createCardOnFile(customerId, opts.cardToken);
  }

  const sub = await sq("/v2/subscriptions", {
    idempotency_key: crypto.randomUUID(),
    location_id: process.env.SQUARE_LOCATION_ID,
    plan_variation_id: variationId,
    customer_id: customerId,
    card_id: cardId,
    source: { name: "caddtruckparking.com" },
  });
  const subscription = sub.subscription as
    | { id?: string; status?: string }
    | undefined;

  return {
    subscriptionId: subscription?.id,
    customerId,
    variationId,
    status: subscription?.status,
    cardId,
    autoCharge: !!cardId,
  };
}

/** Cancel a subscription (stops billing at the end of the current period). */
export async function cancelSubscription(
  id: string,
): Promise<Record<string, unknown>> {
  return sq(`/v2/subscriptions/${id}/cancel`, {});
}
