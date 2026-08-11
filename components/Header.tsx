"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

/** CADD wordmark — red italic CADD over silver script, like the logo.
 *  Drop logo-night.png / logo-day.png into public/brand/ to use the real
 *  artwork instead. */
export function Wordmark({
  logoNight,
  logoDay,
  isDay,
}: {
  logoNight?: string | null;
  logoDay?: string | null;
  isDay?: boolean;
}) {
  const logo = isDay ? (logoDay ?? logoNight) : (logoNight ?? logoDay);
  if (logo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logo} alt="CADD Truck Parking" className="h-11 w-auto" />;
  }
  return (
    <span className="flex flex-col leading-none">
      <span
        className="text-3xl font-black italic tracking-wide text-red"
        style={{ fontFamily: "var(--font-display)" }}
      >
        CADD
      </span>
      <span
        className="chrome -mt-0.5 text-base italic"
        style={{ fontFamily: "var(--font-script)" }}
      >
        Truck Parking
      </span>
    </span>
  );
}

export default function Header({
  logoNight,
  logoDay,
}: {
  logoNight: string | null;
  logoDay: string | null;
}) {
  const { lang, setLang, t } = useLang();
  const [isDay, setIsDay] = useState(false);

  useEffect(() => {
    setIsDay(document.documentElement.classList.contains("day"));
  }, []);

  function toggleTheme() {
    const next = !isDay;
    setIsDay(next);
    document.documentElement.classList.toggle("day", next);
    try {
      localStorage.setItem("cadd-theme", next ? "day" : "night");
    } catch {}
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface0/90 backdrop-blur">
      <div className="stripe h-1.5 w-full" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" aria-label="CADD Truck Parking — Home">
          <Wordmark logoNight={logoNight} logoDay={logoDay} isDay={isDay} />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wider text-muted lg:flex">
          <Link href="/#rates" className="inline-flex min-h-6 items-center transition hover:text-red">
            {t.nav.rates}
          </Link>
          <Link href="/#amenities" className="inline-flex min-h-6 items-center transition hover:text-red">
            {t.nav.amenities}
          </Link>
          <Link href="/#location" className="inline-flex min-h-6 items-center transition hover:text-red">
            {t.nav.location}
          </Link>
          <Link href="/blog" className="inline-flex min-h-6 items-center transition hover:text-red">
            {t.nav.blog}
          </Link>
          <Link href="/terms" className="inline-flex min-h-6 items-center transition hover:text-red">
            {t.nav.terms}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* EN / ES toggle */}
          <div
            className="flex shrink-0 overflow-hidden rounded-lg border border-line text-xs font-bold"
            role="group"
            aria-label="Language / Idioma"
          >
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2.5 py-1.5 uppercase tracking-wider transition ${
                  lang === l
                    ? "bg-redsolid text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {l === "en" ? "EN" : "ES"}
              </button>
            ))}
          </div>

          {/* Day / night toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDay ? "Switch to night mode" : "Switch to day mode"}
            title={isDay ? "Night mode" : "Day mode"}
            className="flex size-8 items-center justify-center rounded-lg border border-line text-base text-muted transition hover:border-red hover:text-red"
          >
            {isDay ? "☾" : "☀"}
          </button>

          {/* Tap-to-call, always reachable without scrolling. Compact icon on
              phones (where space is tight), full stacked number from xl up. */}
          <a
            href={`tel:+${BUSINESS.phoneTollFreeDial}`}
            aria-label={`Call ${BUSINESS.phoneTollFreeVanity}`}
            className="flex size-9 items-center justify-center rounded-lg border border-red text-red transition hover:bg-redsolid hover:text-white xl:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.6 10.8c1.1 2.2 2.9 4 5.1 5.1l1.7-1.7c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-8.3 0-15-6.7-15-15 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .7-.2 1l-1.7 1.8z" />
            </svg>
          </a>
          <a
            href={`tel:+${BUSINESS.phoneTollFreeDial}`}
            className="hidden flex-col items-end leading-tight text-ink transition hover:text-red xl:flex"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="text-sm font-bold">{BUSINESS.phoneTollFreeVanity}</span>
            <span className="text-[11px] text-muted">{BUSINESS.phoneTollFree}</span>
          </a>
          {/* Short label on phones so the row can't squeeze the other controls */}
          <Link
            href="/book"
            className="shrink-0 whitespace-nowrap rounded-lg bg-redsolid px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition hover:bg-reddeep sm:px-3.5 sm:text-sm"
          >
            <span className="sm:hidden">{t.nav.reserveShort}</span>
            <span className="hidden sm:inline">{t.nav.reserve}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
