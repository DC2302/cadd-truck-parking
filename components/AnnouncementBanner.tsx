"use client";

/**
 * The weekly announcement strip.
 *
 * Fetches on its own so the page stays cached — the message changes weekly,
 * the rest of the page doesn't. Renders nothing when no message is running,
 * so a quiet week costs the page nothing.
 *
 * The photograph is a backdrop; the words are real HTML so they stay
 * readable, selectable and indexable. A scrim sits between the two because
 * light text over an unpredictable photo is otherwise a legibility gamble.
 * The band carries its own dark ground in both day and night themes — these
 * are photographs, and they need one.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import {
  pick,
  themeById,
  type Announcement,
} from "@/lib/announcements-types";

export default function AnnouncementBanner() {
  const { lang } = useLang();
  const [ann, setAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/announcement")
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.ok && d.announcement) setAnn(d.announcement);
      })
      .catch(() => {
        /* a missing banner must never break the page */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!ann) return null;
  const t = themeById(ann.theme);
  const facts = (ann.facts ?? []).map((f) => pick(f, lang)).filter(Boolean);
  const ticker = [...facts, pick(ann.kicker, lang)].filter(Boolean);

  return (
    <section
      aria-label={lang === "es" ? "Aviso de esta semana" : "This week at CADD"}
      className="relative overflow-hidden border-y-2"
      style={{ background: t.bg, borderColor: `${t.accent}55` }}
    >
      <Image
        src={t.image}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover object-center opacity-80"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${t.bg}ee 0%, ${t.bg}cc 44%, ${t.bg}40 100%)`,
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: t.accent }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-4 py-9 md:flex-row md:items-center md:gap-10 md:py-11">
        <div className="min-w-0 flex-1">
          {pick(ann.kicker, lang) && (
            <p
              className="text-[0.68rem] font-bold uppercase tracking-[0.18em]"
              style={{ color: t.accent }}
            >
              {pick(ann.kicker, lang)}
            </p>
          )}
          <h2
            className="mt-2 max-w-3xl text-2xl font-black uppercase leading-tight text-white drop-shadow-lg md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {pick(ann.headline, lang)}
          </h2>
          {pick(ann.body, lang) && (
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-neutral-200 drop-shadow md:text-base">
              {pick(ann.body, lang)}
            </p>
          )}

          {facts.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              {facts.map((f) => (
                <span
                  key={f}
                  className="border bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
                  style={{ borderColor: `${t.accent}88` }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}
        </div>

        {ann.cta && pick(ann.cta.label, lang) && (
          <div className="shrink-0 self-start md:self-auto">
            {ann.cta.href.startsWith("/") ? (
              <Link
                href={ann.cta.href}
                className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-90"
                style={{ background: t.accent, color: t.ink }}
              >
                {pick(ann.cta.label, lang)}
              </Link>
            ) : (
              <a
                href={ann.cta.href}
                className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-90"
                style={{ background: t.accent, color: t.ink }}
              >
                {pick(ann.cta.label, lang)}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Scrolling rail — what catches the eye from halfway down the page.
          Pauses on hover so it can be read; reduced-motion users get it still. */}
      {ticker.length > 0 && (
        <div
          className="group relative overflow-hidden border-t"
          style={{ borderColor: `${t.accent}44`, background: `${t.bg}e6` }}
        >
          <div className="flex w-max animate-cadd-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex shrink-0 items-center"
                aria-hidden={copy === 1}
              >
                {ticker.map((item, i) => (
                  <span
                    key={`${copy}-${i}`}
                    className="flex items-center gap-3 whitespace-nowrap px-5 py-2 text-[0.7rem] font-bold uppercase tracking-widest text-neutral-300"
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rotate-45"
                      style={{ background: t.accent }}
                    />
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-16"
            style={{ background: `linear-gradient(90deg, ${t.bg}, transparent)` }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16"
            style={{ background: `linear-gradient(270deg, ${t.bg}, transparent)` }}
          />
        </div>
      )}
    </section>
  );
}
