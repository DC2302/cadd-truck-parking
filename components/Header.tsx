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
          <Link href="/#rates" className="transition hover:text-red">
            {t.nav.rates}
          </Link>
          <Link href="/#amenities" className="transition hover:text-red">
            {t.nav.amenities}
          </Link>
          <Link href="/#location" className="transition hover:text-red">
            {t.nav.location}
          </Link>
          <Link href="/blog" className="transition hover:text-red">
            {t.nav.blog}
          </Link>
          <Link href="/terms" className="transition hover:text-red">
            {t.nav.terms}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* EN / ES toggle */}
          <div
            className="flex overflow-hidden rounded-lg border border-line text-xs font-bold"
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

          <a
            href={`tel:+${BUSINESS.phoneTollFreeDial}`}
            className="hidden text-sm font-semibold text-ink transition hover:text-red xl:inline"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {BUSINESS.phoneTollFree}
          </a>
          <Link
            href="/book"
            className="rounded-lg bg-redsolid px-3.5 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition hover:bg-reddeep"
          >
            {t.nav.reserve}
          </Link>
        </div>
      </div>
    </header>
  );
}
