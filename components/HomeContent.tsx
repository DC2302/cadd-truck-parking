"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";
import MascotFollow from "@/components/MascotFollow";
import PricingCards from "@/components/PricingCards";
import { useLang, fill } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

/** Word-by-word blur-drop reveal (adapted from the DigitalSerenity snippet).
 *  Pure CSS delays — SSR-safe, replays on language switch. */
function WordReveal({
  text,
  baseDelay = 0,
  step = 120,
  wordClass = "",
}: {
  text: string;
  baseDelay?: number;
  step?: number;
  wordClass?: string;
}) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            className={`word-animate ${wordClass}`}
            style={{ animationDelay: `${baseDelay + i * step}ms` }}
          >
            {word}
          </span>{" "}
        </span>
      ))}
    </>
  );
}

export default function HomeContent({
  heroPhoto,
  heroVideo,
  galleryPhotos,
  showTruck,
  mascot,
}: {
  heroPhoto: string | null;
  heroVideo: string | null;
  galleryPhotos: string[];
  showTruck: string | null;
  mascot: string | null;
}) {
  const { t } = useLang();

  // Custom loop: when the clip ends, hold the last frame for 7 seconds,
  // then start over (a native `loop` attribute can't pause between plays).
  const videoRef = useRef<HTMLVideoElement>(null);
  const loopTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(loopTimer.current), []);
  const handleVideoEnded = () => {
    window.clearTimeout(loopTimer.current);
    loopTimer.current = window.setTimeout(() => {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    }, 7000);
  };

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════ */}
      <section className="grain relative overflow-hidden bg-surface0">
        {heroVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-[68%_center] opacity-60"
            style={{ filter: "saturate(0.8) brightness(0.9) contrast(1.05)" }}
            src={heroVideo}
            poster={heroPhoto ?? undefined}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            aria-hidden
          />
        ) : (
          heroPhoto && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: `url(${heroPhoto})`,
                filter: "grayscale(1) contrast(1.05)",
              }}
            />
          )
        )}
        {/* left scrim keeps the headline readable; right side stays clear
            so the video's subject is never covered */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface0 from-15% via-surface0/75 via-45% to-surface0/5" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-surface0 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 md:pb-32 md:pt-28">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-red">
            <WordReveal text={t.hero.kicker} baseDelay={0} step={90} />
          </p>
          <h1
            className="mt-5 max-w-2xl text-6xl font-black uppercase leading-[0.92] text-ink sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <WordReveal text={t.hero.line1} baseDelay={500} step={150} />
            <br />
            <WordReveal
              text={t.hero.line2}
              baseDelay={800}
              step={150}
              wordClass="text-red"
            />
            <br />
            <WordReveal
              text={t.hero.line3}
              baseDelay={1100}
              step={150}
              wordClass="chrome"
            />
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted">
            <WordReveal text={t.hero.sub} baseDelay={1500} step={30} />
          </p>
          <div
            className="rise mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "2400ms" }}
          >
            <Link
              href="/book"
              className="rounded-lg bg-redsolid px-8 py-4 text-base font-bold uppercase tracking-widest text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-reddeep hover:shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
            >
              {t.hero.ctaReserve}
            </Link>
            <Link
              href="/#rates"
              className="rounded-lg border-2 border-ink/40 px-8 py-4 text-base font-bold uppercase tracking-widest text-ink transition hover:border-red hover:text-red"
            >
              {t.hero.ctaRates}
            </Link>
            <a
              href={`tel:+${BUSINESS.phoneTollFreeDial}`}
              className="text-center text-base font-semibold leading-tight text-muted transition hover:text-red"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {BUSINESS.phoneTollFree}
              <span className="block text-sm font-normal">
                {BUSINESS.phoneTollFreeDigits}
              </span>
            </a>
          </div>

          {/* stat strip */}
          <div
            className="card-lift-featured rise mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4"
            style={{ animationDelay: "2700ms" }}
          >
            {t.hero.stats.map(([big, small]) => (
              <div key={small} className="bg-surface1 px-5 py-4">
                <p
                  className="text-3xl font-black text-red"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {big}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {small}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════ */}
      <div className="overflow-hidden border-y-2 border-redsolid bg-redsolid py-3">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {t.marquee.map((item) => (
                <span
                  key={`${copy}-${item}`}
                  className="flex items-center gap-6 pr-6 text-sm font-black uppercase tracking-[0.2em] text-white"
                >
                  {item} <span className="text-lg">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ AMENITIES (silver panel) ══════════════════════════ */}
      <section id="amenities" className="bg-panel py-24 text-panelink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-redsolid">
              {t.amenities.kicker}
            </p>
            <h2
              className="mt-2 max-w-2xl text-6xl font-black uppercase leading-[0.95]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.amenities.title}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {t.amenities.items.map((a, i) => (
              <Reveal key={a.n} delay={(i % 3) * 90}>
                <div className="card-lift card-accent h-full bg-white p-6">
                  <p
                    className="text-5xl font-black text-redsolid/25"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {a.n}
                  </p>
                  <h3
                    className="mt-1 text-2xl font-bold uppercase"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-panelmuted">
                    {a.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RATES (always-dark band, both themes) ═════════════ */}
      <section id="rates" className="grain relative overflow-hidden bg-neutral-950 py-24">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#d2343c]">
              {t.rates.kicker}
            </p>
            <h2
              className="mt-2 text-6xl font-black uppercase text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.rates.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-400">
              {t.rates.sub}
            </p>
          </Reveal>
          <div className="mt-12">
            <PricingCards />
          </div>

          {/* shower comparison */}
          <Reveal className="mt-14">
            <div className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 md:grid-cols-2">
              <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-900 p-8">
                <p
                  className="text-2xl font-bold uppercase text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.rates.showerCompare.basicTitle}
                </p>
                <p
                  className="mt-2 text-4xl font-black text-white"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.rates.showerCompare.basicPrice}
                  <span className="text-xl text-neutral-400">
                    {" "}
                    {t.rates.showerCompare.basicUnit}
                  </span>
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  {t.rates.showerCompare.basicDesc}
                </p>
              </div>
              <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-8">
                <div className="stripe absolute inset-x-0 top-0 h-1" />
                <p
                  className="text-2xl font-bold uppercase text-[#d2343c]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.rates.showerCompare.proTitle}
                </p>
                <p
                  className="mt-2 bg-gradient-to-b from-white via-neutral-400 to-neutral-100 bg-clip-text text-4xl font-black uppercase text-transparent"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.rates.showerCompare.proPrice}
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  {t.rates.showerCompare.proDesc}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ BRAND / ABOUT (show truck) ════════════════════════ */}
      {showTruck && (
        <section className="relative overflow-hidden bg-surface1">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={showTruck}
                alt="CADD Truck Parking show truck"
                className="card-lift-featured w-full object-cover shadow-[0_30px_80px_-30px_rgba(168,30,36,0.45)]"
              />
            </Reveal>
            <Reveal delay={120}>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-red">
                {t.brand.kicker}
              </p>
              <h2
                className="mt-2 text-6xl font-black uppercase leading-[0.95] text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t.brand.title}
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-muted">
                {t.brand.body}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm font-semibold text-ink">
                {[t.brand.point1, t.brand.point2, t.brand.point3].map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="text-red">▸</span> {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══ GALLERY (silver panel) ════════════════════════════ */}
      <section className="bg-panel py-24 text-panelink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-redsolid">
              {t.gallery.kicker}
            </p>
            <h2
              className="mt-2 text-6xl font-black uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.gallery.title}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPhotos.length > 0
              ? galleryPhotos.map((src, i) => (
                  <Reveal key={src} delay={(i % 3) * 90}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`CADD Truck Parking — photo ${i + 1}`}
                      className="card-lift aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </Reveal>
                ))
              : [1, 2, 3, 4, 5, 6].map((i) => (
                  <Reveal key={i} delay={(i % 3) * 90}>
                    <div className="stripe-thin flex aspect-[4/3] items-center justify-center border-4 border-panelink/20 bg-panel">
                      <p className="bg-panel px-4 py-2 text-xs font-bold uppercase tracking-widest text-panelmuted">
                        {fill(t.gallery.comingSoon, { n: String(i) })}
                      </p>
                    </div>
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS (dark) ═══════════════════════════════ */}
      <section className="grain bg-surface0 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red">
              {t.testimonials.kicker}
            </p>
            <h2
              className="mt-2 text-6xl font-black uppercase text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.testimonials.title}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.testimonials.quotes.map((quote, i) => (
              <Reveal key={i} delay={i * 100}>
                <figure className="card-lift flex h-full flex-col border border-line bg-surface1 p-7">
                  <p
                    className="text-6xl leading-none text-red"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    "
                  </p>
                  <blockquote className="flex-1 text-lg leading-relaxed text-ink">
                    {quote}
                  </blockquote>
                  <figcaption
                    className="mt-5 text-xs uppercase tracking-widest text-muted"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    — {t.testimonials.who}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════ */}
      <section className="relative bg-surface1 py-24">
        {/* mascot with the headset — follows the visitor's mouse */}
        <MascotFollow
          mode="follow"
          poses={{
            left: "/brand/mascots/present-left.png",
            right: "/brand/mascots/point-right.png",
            idle: "/brand/mascots/thumbs-up.png",
          }}
          className="pointer-events-none absolute bottom-14 left-6 hidden select-none xl:block 2xl:left-24"
          imgClass="h-72 w-auto drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-red">
              {t.faq.kicker}
            </p>
            <h2
              className="mt-2 text-6xl font-black uppercase text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.faq.title}
            </h2>
            {mascot && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={mascot}
                alt=""
                aria-hidden
                className="mx-auto mt-6 h-36 w-auto"
              />
            )}
          </Reveal>
          <div className="mt-12 space-y-3">
            {t.faq.items.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <details className="group rounded-xl border border-line bg-surface0 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.08)] transition open:border-red">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4">
                    <span
                      className="text-lg font-bold uppercase text-ink"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {f.q}
                    </span>
                    <span className="text-2xl text-red transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <p className="text-sm text-muted">
              {t.faq.fleet}{" "}
              <a
                href={`mailto:${BUSINESS.email}`}
                className="font-bold text-red hover:text-ink"
              >
                {BUSINESS.email}
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ LOCATION (silver panel) ═══════════════════════════ */}
      <section id="location" className="bg-panel py-24 text-panelink">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-redsolid">
              {t.location.kicker}
            </p>
            <h2
              className="mt-2 text-6xl font-black uppercase leading-[0.95]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.location.title}
            </h2>
            <p
              className="mt-6 text-lg font-semibold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {BUSINESS.address}
            </p>
            <p className="mt-3 max-w-md text-panelmuted">{t.location.desc}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={BUSINESS.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-redsolid px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-reddeep"
              >
                {t.location.directions}
              </a>
              <a
                href={`tel:+${BUSINESS.phoneLocalDial}`}
                className="rounded-lg border-2 border-panelink px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-panelink transition hover:border-redsolid hover:text-redsolid"
              >
                {fill(t.location.call, { phone: BUSINESS.phoneLocal })}
              </a>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card-lift-featured overflow-hidden">
              <iframe
                title="Map to CADD Truck Parking"
                src="https://www.google.com/maps?q=4500+East+County+Road+130,+Midland,+TX+79706&output=embed"
                className="h-96 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-redsolid py-20 text-white">
        {/* mascot celebrating the reservation — leans toward the cursor */}
        <MascotFollow
          mode="lean"
          src="/brand/mascots/cheer.png"
          className="pointer-events-none absolute -bottom-1 right-[3%] hidden select-none lg:block"
          imgClass="h-56 w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.4)]"
        />
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <h2
              className="text-7xl font-black uppercase leading-[0.9]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg font-semibold text-white/90">
              {t.cta.sub}
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-lg bg-white px-10 py-4 text-base font-bold uppercase tracking-widest text-redsolid shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-panel hover:shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
            >
              {t.cta.btn}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
