/**
 * Square Payment Links — one call, no SDK.
 *
 * Creates a hosted Square checkout page for the selected plan/term and
 * returns its URL. Requires SQUARE_ACCESS_TOKEN + SQUARE_LOCATION_ID
 * (sandbox or production per SQUARE_ENV).
 */

export function squareConfigured(): boolean {
  return !!process.env.SQUARE_ACCESS_TOKEN && !!process.env.SQUARE_LOCATION_ID;
}

export async function createPaymentLink(opts: {
  title: string; // e.g. "IronHauler — Monthly Parking"
  amountUsd: number;
  confirmationCode: string;
  buyerEmail?: string;
}): Promise<string> {
  const base =
    process.env.SQUARE_ENV === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const makeBody = (includeEmail: boolean) =>
    JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      quick_pay: {
        name: `${opts.title} (${opts.confirmationCode})`,
        price_money: {
          amount: Math.round(opts.amountUsd * 100),
          currency: "USD",
        },
        location_id: process.env.SQUARE_LOCATION_ID,
      },
      checkout_options: {
        redirect_url: `${siteUrl}/book?paid=${encodeURIComponent(opts.confirmationCode)}`,
        ask_for_shipping_address: false,
      },
      pre_populated_data:
        includeEmail && opts.buyerEmail
          ? { buyer_email: opts.buyerEmail }
          : undefined,
      payment_note: `CADD Truck Parking ${opts.confirmationCode}`,
    });

  const post = (body: string) =>
    fetch(`${base}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2025-05-21",
      },
      body,
    });

  let res = await post(makeBody(true));
  if (!res.ok) {
    const detail = await res.text();
    // The email prefill is a nicety — if Square rejects the address,
    // create the link without it rather than failing the checkout.
    if (opts.buyerEmail && detail.includes("INVALID_EMAIL_ADDRESS")) {
      res = await post(makeBody(false));
      if (!res.ok) {
        throw new Error(`Square error ${res.status}: ${await res.text()}`);
      }
    } else {
      throw new Error(`Square error ${res.status}: ${detail}`);
    }
  }
  const json = (await res.json()) as { payment_link?: { url?: string } };
  const url = json.payment_link?.url;
  if (!url) throw new Error("Square did not return a payment link URL");
  return url;
}
