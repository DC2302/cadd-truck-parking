import { NextRequest, NextResponse } from "next/server";
import { getPlan, getPrice, TERMS_LIST } from "@/lib/pricing";
import { TERMS_VERSION } from "@/lib/terms";
import { createPaymentLink, squareConfigured } from "@/lib/square";
import {
  AcceptanceRecord,
  newConfirmationCode,
  saveAcceptance,
} from "@/lib/store";
import { allocateSpace, holdSpaces } from "@/lib/spaces-store";

export const runtime = "nodejs";

const OFFLINE_METHODS = new Set(["zelle", "cashapp", "cash", "other"]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const str = (k: string) =>
    typeof body[k] === "string" ? (body[k] as string).trim() : "";

  const name = str("name");
  const company = str("company");
  const email = str("email");
  const phone = str("phone");
  const vehicle = str("vehicle");
  const plan = str("plan");
  const term = str("term");
  const paymentMethod = str("paymentMethod");
  const signature = str("signature");
  const acceptedTerms = body["acceptedTerms"] === true;
  const lang = str("lang") === "es" ? "es" : "en";

  // ── Validation ────────────────────────────────────────────────
  const errors: string[] = [];
  if (name.length < 2) errors.push("Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Enter a valid email address.");
  if (phone.replace(/\D/g, "").length < 10)
    errors.push("Enter a valid phone number.");
  const planObj = getPlan(plan);
  const price = getPrice(plan, term);
  if (!planObj || price === undefined)
    errors.push("Choose a plan and a rate option.");
  if (!TERMS_LIST.some((t) => t.id === term))
    errors.push("Choose a rate option.");
  if (paymentMethod !== "square" && !OFFLINE_METHODS.has(paymentMethod))
    errors.push("Choose a payment method.");
  if (!acceptedTerms)
    errors.push("You must accept the Terms & Conditions to reserve a space.");
  if (signature.length < 2)
    errors.push("Type your full legal name as your signature.");

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  // ── Space assignment ─────────────────────────────────────────
  // Customer-picked spaces (from the lot map) are held all-or-nothing;
  // if none were picked, auto-assign the lowest-numbered open space.
  const requested = Array.isArray(body["spaces"])
    ? (body["spaces"] as unknown[])
        .filter((x): x is string => typeof x === "string")
        .slice(0, 4)
    : [];
  const confirmationCode = newConfirmationCode();
  let space = "";
  try {
    if (requested.length > 0) {
      const held = await holdSpaces(requested, confirmationCode, name);
      if (!held) {
        return NextResponse.json(
          {
            error:
              lang === "es"
                ? "Uno de los espacios que elegiste se acaba de ocupar. El mapa se actualizó — elige de nuevo."
                : "One of the spaces you picked was just taken. The map has refreshed — please pick again.",
            spaceConflict: true,
          },
          { status: 409 },
        );
      }
      space = held.join(", ");
    } else {
      space = await allocateSpace(confirmationCode, name);
    }
  } catch (e) {
    console.error("Space allocation failed:", e);
  }
  const spaceCount = requested.length > 0 ? requested.length : 1;

  // ── Record the acceptance FIRST, regardless of payment path ──
  const record: AcceptanceRecord = {
    id: confirmationCode,
    createdAt: new Date().toISOString(),
    name,
    company,
    email,
    phone,
    vehicle,
    plan: planObj!.name,
    term,
    priceUsd: price!,
    paymentMethod,
    paymentStatus:
      paymentMethod === "square" ? "sent-to-square" : "pay-on-arrival",
    signature,
    termsVersion: TERMS_VERSION,
    lang,
    space,
    ip:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "",
    userAgent: req.headers.get("user-agent") || "",
  };

  try {
    await saveAcceptance(record);
  } catch (e) {
    console.error("Failed to save acceptance:", e);
    return NextResponse.json(
      { error: "We couldn't save your reservation. Please call 1-877-607-CADD." },
      { status: 500 },
    );
  }

  // Optional emails: acceptance copy to the owner + thank-you to the customer.
  void sendOwnerEmail(record).catch((e) =>
    console.error("Acceptance email failed:", e),
  );
  void sendCustomerEmail(record).catch((e) =>
    console.error("Thank-you email failed:", e),
  );

  // ── Payment path ──────────────────────────────────────────────
  if (paymentMethod === "square") {
    if (!squareConfigured()) {
      return NextResponse.json({
        ok: true,
        confirmation: record.id,
        space: record.space,
        checkoutUrl: null,
        note:
          "Online card payment isn't connected yet — your acceptance is on file. Pay on arrival or call us to pay by card.",
      });
    }
    try {
      const termLabel =
        TERMS_LIST.find((t) => t.id === term)?.label ?? term;
      const url = await createPaymentLink({
        title: `${planObj!.name} — ${termLabel} Truck Parking${spaceCount > 1 ? ` × ${spaceCount} spaces` : ""}`,
        amountUsd: price! * spaceCount,
        confirmationCode: record.id,
        buyerEmail: email,
      });
      return NextResponse.json({
        ok: true,
        confirmation: record.id,
        space: record.space,
        checkoutUrl: url,
      });
    } catch (e) {
      console.error(e);
      return NextResponse.json({
        ok: true,
        confirmation: record.id,
        space: record.space,
        checkoutUrl: null,
        note:
          "Your acceptance is on file, but we couldn't open card checkout. Pay on arrival or call 1-877-607-CADD to pay by card.",
      });
    }
  }

  return NextResponse.json({ ok: true, confirmation: record.id, space: record.space, checkoutUrl: null });
}

/** Bilingual thank-you email to the customer (needs RESEND_API_KEY). */
async function sendCustomerEmail(rec: AcceptanceRecord) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !rec.email) return;
  const es = rec.lang === "es";
  const payLine: Record<string, [string, string]> = {
    square: [
      "Complete your card payment through the secure Square checkout to lock in your space.",
      "Completa tu pago con tarjeta en el checkout seguro de Square para apartar tu espacio.",
    ],
    zelle: [
      "Send your payment with Zelle to Daniel Sanchez at 325-450-7486 and put your confirmation code in the memo — your space locks in when it lands.",
      "Envía tu pago por Zelle a Daniel Sanchez al 325-450-7486 y pon tu código de confirmación en la nota — tu espacio queda apartado en cuanto llegue.",
    ],
    cashapp: [
      "Send your payment on Cash App to $dc23cadd and put your confirmation code in the note — your space locks in when it lands.",
      "Envía tu pago por Cash App a $dc23cadd y pon tu código de confirmación en la nota — tu espacio queda apartado en cuanto llegue.",
    ],
    cash: [
      "Pay cash when you arrive — the facilities officer will issue a receipt.",
      "Paga en efectivo cuando llegues — el encargado te dará tu recibo.",
    ],
  };
  const pay = payLine[rec.paymentMethod]?.[es ? 1 : 0] ?? "";
  const lines = es
    ? [
        `¡Gracias por reservar con CADD Truck Parking, ${rec.name}!`,
        ``,
        `Código de confirmación: ${rec.id}`,
        ...(rec.space ? [`Tu espacio asignado: #${rec.space}`] : []),
        `Plan: ${rec.plan} — ${rec.term} — $${rec.priceUsd}`,
        ``,
        pay,
        ``,
        `Tu aceptación de los Términos y Condiciones (versión ${rec.termsVersion}) quedó registrada el ${rec.createdAt}.`,
        `Términos completos: https://caddtruckparking.com/terms`,
        ``,
        `Ubicación: 4500 East County Road 130, Midland, TX 79706`,
        `¿Preguntas? 1-877-607-CADD (1-877-607-2233) · (325) 450-7486 · caddrealty@gmail.com`,
        ``,
        `— El equipo de CADD Truck Parking`,
      ]
    : [
        `Thanks for reserving with CADD Truck Parking, ${rec.name}!`,
        ``,
        `Confirmation code: ${rec.id}`,
        ...(rec.space ? [`Your assigned space: #${rec.space}`] : []),
        `Plan: ${rec.plan} — ${rec.term} — $${rec.priceUsd}`,
        ``,
        pay,
        ``,
        `Your acceptance of the Terms & Conditions (version ${rec.termsVersion}) was recorded at ${rec.createdAt}.`,
        `Full terms: https://caddtruckparking.com/terms`,
        ``,
        `Find us: 4500 East County Road 130, Midland, TX 79706`,
        `Questions? 1-877-607-CADD (1-877-607-2233) · (325) 450-7486 · caddrealty@gmail.com`,
        ``,
        `— The CADD Truck Parking team`,
      ];
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CADD Truck Parking <onboarding@resend.dev>",
      to: [rec.email],
      subject: es
        ? `Reservación ${rec.id} — CADD Truck Parking`
        : `Reservation ${rec.id} — CADD Truck Parking`,
      text: lines.join("\n"),
    }),
  });
}

async function sendOwnerEmail(rec: AcceptanceRecord) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.OWNER_EMAIL;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CADD Truck Parking <onboarding@resend.dev>",
      to: [to],
      subject: `Signed T&C acceptance ${rec.id} — ${rec.name} (${rec.plan} ${rec.term}, ${rec.paymentMethod})`,
      text: [
        `New Terms & Conditions acceptance on file.`,
        ``,
        `Confirmation: ${rec.id}`,
        `Space assigned (held): ${rec.space || "NONE AVAILABLE — assign manually"}`,
        `Time (UTC): ${rec.createdAt}`,
        `Name: ${rec.name}`,
        `Company: ${rec.company || "—"}`,
        `Email: ${rec.email}`,
        `Phone: ${rec.phone}`,
        `Vehicle: ${rec.vehicle || "—"}`,
        `Plan: ${rec.plan} — ${rec.term} — $${rec.priceUsd}`,
        `Payment: ${rec.paymentMethod} (${rec.paymentStatus})`,
        `Signature (typed): ${rec.signature}`,
        `Terms version: ${rec.termsVersion}`,
        `Language at acceptance: ${rec.lang}`,
        `IP: ${rec.ip}`,
        `Browser: ${rec.userAgent}`,
      ].join("\n"),
    }),
  });
}
