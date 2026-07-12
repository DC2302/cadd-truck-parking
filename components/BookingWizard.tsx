"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PLANS,
  TERMS_LIST,
  PlanId,
  TermId,
  formatUSD,
  BUSINESS,
} from "@/lib/pricing";
import LotMap from "@/components/LotMap";
import type { SpaceStatus } from "@/lib/lot-map";
import {
  TERMS_INTRO,
  TERMS_SECTIONS,
  TERMS_VERSION,
  TERMS_EFFECTIVE,
} from "@/lib/terms";
import { useLang, fill } from "@/lib/i18n";

type PaymentMethod = "square" | "zelle" | "cashapp" | "cash";
const PAYMENT_IDS: PaymentMethod[] = ["square", "zelle", "cashapp", "cash"];

interface Result {
  confirmation: string;
  space?: string;
  checkoutUrl: string | null;
  note?: string;
  paymentMethod: PaymentMethod;
}

export default function BookingWizard() {
  const { t, lang } = useLang();
  const params = useSearchParams();
  const paidCode = params.get("paid");

  const initialPlan = (["trailblazer", "ironhauler"].includes(
    params.get("plan") || "",
  )
    ? params.get("plan")
    : "trailblazer") as PlanId;
  const initialTerm = (TERMS_LIST.some((tm) => tm.id === params.get("term"))
    ? params.get("term")
    : "monthly") as TermId;

  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [termId, setTermId] = useState<TermId>(initialTerm);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("square");
  const [spaceStatuses, setSpaceStatuses] = useState<Record<string, SpaceStatus>>({});
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);

  const loadSpaces = useCallback(async () => {
    try {
      const res = await fetch("/api/spaces", { cache: "no-store" });
      const json = await res.json();
      setSpaceStatuses(json.statuses ?? {});
      setAvailableCount(json.available ?? 0);
      setSelectedSpaces((prev) =>
        prev.filter((id) => json.statuses?.[id] === "available"),
      );
    } catch {
      /* map stays empty; auto-assign still works */
    }
  }, []);
  useEffect(() => {
    void loadSpaces();
  }, [loadSpaces]);

  function toggleSpace(id: string) {
    setSelectedSpaces((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
          ? prev
          : [...prev, id],
    );
  }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const plan = PLANS.find((p) => p.id === planId)!;
  const unitPrice = plan.prices[termId];
  const spaceCount = Math.max(1, selectedSpaces.length);
  const price = unitPrice * spaceCount;
  const termLabel = t.rates.terms[termId];

  const canSubmit = useMemo(
    () =>
      name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      phone.replace(/\D/g, "").length >= 10 &&
      accepted &&
      signature.trim().length >= 2 &&
      !submitting,
    [name, email, phone, accepted, signature, submitting],
  );

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          email,
          phone,
          vehicle,
          plan: planId,
          term: termId,
          paymentMethod: payment,
          signature,
          acceptedTerms: accepted,
          lang,
          spaces: selectedSpaces,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t.book.errors.generic);
        if (json.spaceConflict) {
          setSelectedSpaces([]);
          void loadSpaces();
        }
        return;
      }
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
        return;
      }
      setResult({
        confirmation: json.confirmation,
        space: json.space || "",
        checkoutUrl: json.checkoutUrl,
        note: json.note,
        paymentMethod: payment,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(fill(t.book.errors.network, { phone: BUSINESS.phoneTollFree }));
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Page heading (translated here so /book stays a server page) */
  const heading = (
    <div className="mb-12">
      <p className="text-sm font-bold uppercase tracking-[0.35em] text-red">
        {t.book.metaKicker}
      </p>
      <h1
        className="mt-2 text-6xl font-black uppercase leading-[0.95] text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t.book.title}
      </h1>
      <p className="mt-4 max-w-2xl text-muted">{t.book.sub}</p>
    </div>
  );

  /* ── Post-Square return banner ─────────────────────────────── */
  if (paidCode && !result) {
    return (
      <ConfirmationCard
        title={t.book.confirm.paidTitle}
        codeLabel={t.book.confirm.code}
        homeLabel={t.book.confirm.home}
        confirmation={paidCode}
        lines={[
          t.book.confirm.paidLine1,
          fill(t.book.confirm.paidLine2, { phone: BUSINESS.phoneTollFree }),
        ]}
      />
    );
  }

  /* ── Reservation complete (offline payment) ────────────────── */
  if (result) {
    const offline =
      result.paymentMethod !== "square"
        ? t.book.confirm.offline[result.paymentMethod]
        : "";
    return (
      <ConfirmationCard
        title={t.book.confirm.reservedTitle}
        codeLabel={t.book.confirm.code}
        homeLabel={t.book.confirm.home}
        confirmation={result.confirmation}
        space={result.space}
        spaceLabel={t.book.confirm.space}
        lines={[
          fill(t.book.confirm.onFile, { version: TERMS_VERSION }),
          result.note || offline,
          fill(t.book.confirm.amountDue, {
            amount: formatUSD(price),
            plan: plan.name,
            term: termLabel.toLowerCase(),
            phone1: BUSINESS.phoneTollFree,
            phone2: BUSINESS.phoneLocal,
          }),
        ].filter(Boolean)}
      />
    );
  }

  /* ── The wizard ────────────────────────────────────────────── */
  return (
    <div>
      {heading}
      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12">
          {/* STEP 1 — pick a space on the live lot map */}
          <StepBlock n="1" title={t.book.stepSpace}>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              {availableCount === 0 ? t.book.map.full : t.book.map.note}
            </p>
            <div className="card-lift-featured overflow-hidden">
              <LotMap
                statuses={spaceStatuses}
                selected={selectedSpaces}
                onSelect={toggleSpace}
                selectableOnly
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-ink">
              {selectedSpaces.length > 0 ? (
                <>
                  {t.book.map.selected}{" "}
                  <span className="font-black text-red">
                    {selectedSpaces.map((s) => `#${s}`).join("  ")}
                  </span>
                </>
              ) : (
                <span className="text-muted">{t.book.map.none}</span>
              )}
              {selectedSpaces.length >= 4 && (
                <span className="ml-2 text-xs text-muted">{t.book.map.fleetNote}</span>
              )}
            </p>
          </StepBlock>

          {/* STEP 2 — plan */}
          <StepBlock n="2" title={t.book.step1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {PLANS.map((p) => {
                const active = p.id === planId;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlanId(p.id)}
                    className={`card-lift border p-5 text-left ${
                      active
                        ? "border-red bg-surface1 shadow-[0_0_40px_-18px_rgba(168,30,36,0.55)]"
                        : "border-line bg-surface1/50 hover:border-muted"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-[0.25em] ${active ? "text-red" : "text-muted"}`}
                    >
                      {t.rates.plans[p.id].kicker}
                    </p>
                    <p
                      className="mt-1 text-3xl font-black uppercase text-ink"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.name}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      {t.rates.plans[p.id].showers}
                    </p>
                  </button>
                );
              })}
            </div>
          </StepBlock>

          {/* STEP 3 — term */}
          <StepBlock n="3" title={t.book.step2}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TERMS_LIST.map((tm) => {
                const active = tm.id === termId;
                return (
                  <button
                    key={tm.id}
                    onClick={() => setTermId(tm.id)}
                    className={`card-lift border px-3 py-4 text-center ${
                      active
                        ? "border-red bg-surface1"
                        : "border-line bg-surface1/50 hover:border-muted"
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">
                      {t.rates.terms[tm.id]}
                    </p>
                    <p
                      className={`mt-1 text-2xl font-black ${active ? "text-red" : "text-ink"}`}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {formatUSD(plan.prices[tm.id])}
                    </p>
                    {tm.id === "annual" && (
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-red">
                        {t.rates.twoFree}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </StepBlock>

          {/* STEP 4 — driver info */}
          <StepBlock n="4" title={t.book.step3}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.book.fields.name}>
                <input
                  className={inputCls}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.book.fields.namePh}
                  autoComplete="name"
                />
              </Field>
              <Field label={t.book.fields.company}>
                <input
                  className={inputCls}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={t.book.fields.companyPh}
                  autoComplete="organization"
                />
              </Field>
              <Field label={t.book.fields.email}>
                <input
                  className={inputCls}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>
              <Field label={t.book.fields.phone}>
                <input
                  className={inputCls}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(432) 555-0100"
                  autoComplete="tel"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t.book.fields.vehicle}>
                  <input
                    className={inputCls}
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    placeholder={t.book.fields.vehiclePh}
                  />
                </Field>
              </div>
            </div>
          </StepBlock>

          {/* STEP 5 — terms */}
          <StepBlock n="5" title={t.book.step4}>
            <div className="overflow-hidden rounded-xl border border-line bg-surface1">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <p
                  className="text-xs uppercase tracking-widest text-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {fill(t.book.termsBar, {
                    version: TERMS_VERSION,
                    date: TERMS_EFFECTIVE,
                  })}
                </p>
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-xs font-bold uppercase tracking-wider text-red hover:text-ink"
                >
                  {t.book.openFull}
                </Link>
              </div>
              <div className="h-72 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-muted">
                {TERMS_INTRO.map((p, i) => (
                  <p key={i} className="mb-3 font-semibold text-ink">
                    {p}
                  </p>
                ))}
                {TERMS_SECTIONS.map((s) => (
                  <div key={s.id} className="mb-4">
                    <p className="mb-1.5 font-bold uppercase tracking-wide text-ink">
                      {s.title}
                    </p>
                    {s.body.map((p, i) => (
                      <p key={i} className="mb-2">
                        {p}
                      </p>
                    ))}
                    {s.items && (
                      <ul className="mb-2 list-disc space-y-1 pl-5">
                        {s.items.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    )}
                    {s.after?.map((p, i) => (
                      <p key={i} className="mb-2">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {t.book.termsLangNote && (
              <p className="mt-3 text-xs font-semibold leading-relaxed text-red">
                {t.book.termsLangNote}
              </p>
            )}

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface1 p-4 transition has-[:checked]:border-red">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 size-5 shrink-0"
                style={{ accentColor: "var(--color-redsolid)" }}
              />
              <span className="text-sm leading-relaxed text-ink">
                {checkboxText(t.book.checkbox, t.book.checkboxLink)}
              </span>
            </label>

            <Field label={t.book.fields.signature} className="mt-4">
              <input
                className={`${inputCls} italic`}
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={t.book.fields.namePh}
              />
            </Field>
          </StepBlock>

          {/* STEP 6 — payment */}
          <StepBlock n="6" title={t.book.step5}>
            <div className="space-y-3">
              {PAYMENT_IDS.map((id) => {
                const active = payment === id;
                const opt = t.book.payments[id];
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition ${
                      active
                        ? "border-red bg-surface1"
                        : "border-line bg-surface1/50 hover:border-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={active}
                      onChange={() => setPayment(id)}
                      className="size-4"
                      style={{ accentColor: "var(--color-redsolid)" }}
                    />
                    <span>
                      <span className="block text-sm font-bold uppercase tracking-wider text-ink">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-muted">
                        {opt.desc}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {t.book.payNote}
            </p>

            {error && (
              <div className="mt-5 border border-red bg-red/10 p-4 text-sm font-semibold text-ink">
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="mt-6 w-full rounded-lg bg-redsolid py-4 text-base font-bold uppercase tracking-widest text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-reddeep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? t.book.submitting
                : payment === "square"
                  ? fill(t.book.submitPay, { amount: formatUSD(price) })
                  : t.book.submitReserve}
            </button>
            {!accepted && (
              <p className="mt-2 text-center text-xs text-muted">
                {t.book.mustAccept}
              </p>
            )}
          </StepBlock>
        </div>

        {/* ── Sticky permit ticket ─────────────────────────────── */}
        <aside className="order-first lg:order-none">
          <div className="lg:sticky lg:top-24">
            <div className="ticket-notch border-2 border-dashed border-redsolid/60 bg-paper p-6 text-panelink">
              <p
                className="text-center text-xs font-bold uppercase tracking-[0.3em] text-redsolid"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t.book.ticket.draft}
              </p>
              <div className="stripe-thin my-4 h-2 opacity-60" />
              <TicketRow k={t.book.ticket.facility} v="CADD Truck Parking" />
              <TicketRow k={t.book.ticket.location} v="Midland, TX 79706" />
              <TicketRow k={t.book.ticket.plan} v={plan.name} strong />
              <TicketRow
                k={t.book.ticket.rate}
                v={`${termLabel} — ${formatUSD(unitPrice)}${spaceCount > 1 ? ` × ${spaceCount}` : ""}`}
                strong
              />
              {selectedSpaces.length > 0 && (
                <TicketRow
                  k="#"
                  v={selectedSpaces.map((x) => `#${x}`).join(" ")}
                  strong
                />
              )}
              <TicketRow
                k={t.book.ticket.showers}
                v={
                  planId === "ironhauler"
                    ? t.book.ticket.unlimited
                    : t.book.ticket.perMin
                }
              />
              <TicketRow k={t.book.ticket.holder} v={name.trim() || "—"} />
              <TicketRow
                k={t.book.ticket.terms}
                v={
                  accepted
                    ? `${t.book.ticket.accepted} · ${TERMS_VERSION}`
                    : t.book.ticket.notAccepted
                }
              />
              <div className="stripe-thin my-4 h-2 opacity-60" />
              <p
                className="text-center text-3xl font-black"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatUSD(price)}
                <span className="ml-1 text-sm font-semibold text-panelmuted">
                  {t.rates.units[termId]}
                </span>
              </p>
              {termId === "annual" && (
                <p className="text-center text-xs font-bold uppercase tracking-wider text-redsolid">
                  {t.book.ticket.includes2Free}
                </p>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              {t.book.ticket.spaceNote}
            </p>
            <img
              src="/brand/mascots/thumbs-up.png"
              alt=""
              aria-hidden
              loading="lazy"
              className="pointer-events-none mx-auto mt-6 hidden h-44 w-auto select-none drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] lg:block"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ── little helpers ──────────────────────────────────────────── */

const inputCls =
  "w-full rounded-lg border border-line bg-surface1 px-4 py-3 text-ink placeholder:text-muted/50 outline-none transition focus:border-red";

/** Render the checkbox sentence with {link}/{version} placeholders. */
function checkboxText(tpl: string, linkLabel: string) {
  const [before, after] = fill(tpl, { version: TERMS_VERSION }).split(
    "{link}",
  );
  return (
    <>
      {before}
      <Link
        href="/terms"
        target="_blank"
        className="font-bold text-red underline"
      >
        {linkLabel}
      </Link>
      {after}
    </>
  );
}

function StepBlock({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-4">
        <span
          className="flex size-10 items-center justify-center bg-redsolid text-xl font-black text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {n}
        </span>
        <h2
          className="text-3xl font-black uppercase text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function TicketRow({
  k,
  v,
  strong = false,
}: {
  k: string;
  v: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span
        className="text-xs uppercase tracking-widest text-panelmuted/70"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {k}
      </span>
      <span
        className={`text-right ${strong ? "font-black uppercase" : "font-semibold"}`}
      >
        {v}
      </span>
    </div>
  );
}

function ConfirmationCard({
  title,
  confirmation,
  lines,
  codeLabel,
  homeLabel,
  space,
  spaceLabel,
}: {
  title: string;
  confirmation: string;
  lines: string[];
  codeLabel: string;
  homeLabel: string;
  space?: string;
  spaceLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="ticket-notch border-2 border-dashed border-redsolid bg-paper p-8 text-panelink">
        <p
          className="text-center text-xs font-bold uppercase tracking-[0.3em] text-redsolid"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ★ CADD Truck Parking ★
        </p>
        <h1
          className="mt-3 text-center text-5xl font-black uppercase leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        <div className="stripe-thin my-6 h-2 opacity-60" />
        <p className="text-center text-xs font-bold uppercase tracking-widest text-panelmuted">
          {codeLabel}
        </p>
        <p
          className="text-center text-4xl font-black tracking-wider"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {confirmation}
        </p>
        {space && spaceLabel && (
          <p className="mt-2 text-center text-sm font-bold uppercase tracking-widest text-redsolid">
            {spaceLabel}: #{space}
          </p>
        )}
        <div className="stripe-thin my-6 h-2 opacity-60" />
        {lines.map((l, i) => (
          <p key={i} className="mb-3 text-center text-sm leading-relaxed">
            {l}
          </p>
        ))}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-block bg-redsolid px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-reddeep"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
