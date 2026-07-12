"use client";

import { useState } from "react";
import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion } from "motion/react";
import Reveal from "@/components/Reveal";
import MascotFollow from "@/components/MascotFollow";
import { PLANS, TERMS_LIST, PlanId, formatUSD, annualSavings } from "@/lib/pricing";
import { useLang, fill } from "@/lib/i18n";

/* ── Plan switch: Trailblazer / IronHauler ───────────────────── */
function PlanSwitch({
  planId,
  onSwitch,
}: {
  planId: PlanId;
  onSwitch: (p: PlanId) => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="relative z-10 mx-auto flex w-fit rounded-full border border-neutral-700 bg-neutral-900 p-1">
        {PLANS.map((plan) => {
          const active = planId === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => onSwitch(plan.id)}
              className={`relative z-10 h-11 w-fit rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wider transition-colors sm:px-7 ${
                active ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="plan-switch"
                  className="absolute left-0 top-0 h-11 w-full rounded-full border-4 border-neutral-500 bg-gradient-to-t from-neutral-950 to-neutral-600 shadow-sm shadow-neutral-400/40"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span
                className="relative"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {plan.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── The pricing grid: 4 term cards ──────────────────────────── */
export default function PricingCards() {
  const { t } = useLang();
  const [planId, setPlanId] = useState<PlanId>("trailblazer");
  const plan = PLANS.find((p) => p.id === planId)!;
  const copy = t.rates.plans[planId];

  return (
    <div className="relative">
      {/* grid-line + silver glow backdrop (grays, not blues) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-24 h-96 overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff14_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:70px_80px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, #c7cbd226 0%, transparent 65%)",
          }}
        />
      </div>

      <Reveal blur className="relative">
        <PlanSwitch planId={planId} onSwitch={setPlanId} />
        <p className="mt-4 text-center text-sm text-neutral-400">
          <AnimatePresence mode="wait">
            <motion.span
              key={planId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-block"
            >
              {copy.showers}
            </motion.span>
          </AnimatePresence>
        </p>
      </Reveal>

      {/* 4 term cards */}
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {TERMS_LIST.map((term, index) => {
          const popular = term.id === "monthly";
          const price = plan.prices[term.id];
          return (
            <Reveal blur key={term.id} delay={index * 120}>
              <div
                className={`card-lift relative flex h-full flex-col border p-6 text-white ${
                  popular
                    ? "z-20 border-neutral-600 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 shadow-[0px_-13px_120px_-20px_#c7cbd255]"
                    : "z-10 border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-t from-neutral-950 to-neutral-700 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-200 ring-1 ring-neutral-500">
                    {t.rates.mostPopular}
                  </span>
                )}

                <h3
                  className="text-2xl font-bold uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.rates.terms[term.id]}
                </h3>

                <div className="mt-2 flex items-baseline">
                  <span
                    className="text-4xl font-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    <NumberFlow
                      value={price}
                      format={{
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      }}
                      className="text-4xl font-black"
                    />
                  </span>
                  <span className="ml-1 text-sm text-neutral-400">
                    {t.rates.units[term.id]}
                  </span>
                </div>

                <p className="mt-2 min-h-10 text-xs leading-relaxed text-neutral-400">
                  {t.rates.termTag[term.id]}
                </p>

                {term.id === "annual" && (
                  <p
                    className="text-xs font-bold uppercase tracking-wider text-red"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {t.rates.twoFree} ·{" "}
                    {fill(t.rates.saveVsMonthly, {
                      amount: formatUSD(annualSavings(plan)),
                    })}
                  </p>
                )}

                <div className="flex-1" />

                <Link
                  href={`/book?plan=${planId}&term=${term.id}`}
                  className={`mt-5 block rounded-lg p-3 text-center text-sm font-bold uppercase tracking-widest transition ${
                    popular
                      ? "border border-red bg-gradient-to-t from-reddeep to-redsolid text-white shadow-lg shadow-reddeep/60 hover:brightness-110"
                      : "border border-neutral-700 bg-gradient-to-t from-neutral-950 to-neutral-700 text-white shadow-lg shadow-neutral-950 hover:brightness-125"
                  }`}
                >
                  {fill(t.rates.reserveBtn, { plan: plan.name })}
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* mascot presenting the included list — leans toward the cursor */}
      <MascotFollow
        mode="lean"
        src="/brand/mascots/present-left.png"
        className="pointer-events-none absolute -bottom-3 right-0 z-30 hidden select-none xl:block"
        imgClass="h-64 w-auto drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
      />

      {/* what's included with the selected plan */}
      <Reveal
        blur
        delay={200}
        className="relative mx-auto max-w-5xl rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-6 xl:pr-56"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={planId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h4
              className="text-xl font-bold uppercase text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {fill(t.rates.included, { plan: plan.name })}
            </h4>
            <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {copy.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="size-2.5 shrink-0 rounded-full bg-neutral-500" />
                  <span
                    className={`text-sm ${
                      f.includes("UNLIMITED") || f.includes("ILIMITADAS")
                        ? "font-bold text-red"
                        : "text-neutral-300"
                    }`}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </div>
  );
}
