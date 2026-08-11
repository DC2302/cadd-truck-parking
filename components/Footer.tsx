"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

/** Brand glyphs, keyed by the names in BUSINESS.socials. */
const SOCIAL_ICONS: Record<string, string> = {
  Facebook:
    "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94z",
  Instagram:
    "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.96.24 2.42.4.61.24 1.05.52 1.5.98.46.45.74.89.98 1.5.16.46.35 1.25.4 2.42.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.96-.4 2.42-.24.61-.52 1.05-.98 1.5-.45.46-.89.74-1.5.98-.46.16-1.25.35-2.42.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.96-.24-2.42-.4-.61-.24-1.05-.52-1.5-.98-.46-.45-.74-.89-.98-1.5-.16-.46-.35-1.25-.4-2.42C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.24-1.96.4-2.42.24-.61.52-1.05.98-1.5.45-.46.89-.74 1.5-.98.46-.16 1.25-.35 2.42-.4C8.42 2.17 8.8 2.16 12 2.16zm0 3.19a6.65 6.65 0 100 13.3 6.65 6.65 0 000-13.3zm0 10.97a4.32 4.32 0 110-8.64 4.32 4.32 0 010 8.64zm8.47-11.24a1.55 1.55 0 11-3.1 0 1.55 1.55 0 013.1 0z",
  TikTok:
    "M16.6 5.82A4.28 4.28 0 0115.54 3h-3.09v12.4a2.59 2.59 0 11-1.85-2.48V9.8a5.66 5.66 0 105.66 5.66V9.01a7.35 7.35 0 004.28 1.37V7.3a4.29 4.29 0 01-3.94-1.48z",
  YouTube:
    "M23 12s0-3.2-.41-4.74a2.5 2.5 0 00-1.76-1.76C19.29 5.09 12 5.09 12 5.09s-7.29 0-8.83.41A2.5 2.5 0 001.41 7.26C1 8.8 1 12 1 12s0 3.2.41 4.74a2.5 2.5 0 001.76 1.76c1.54.41 8.83.41 8.83.41s7.29 0 8.83-.41a2.5 2.5 0 001.76-1.76C23 15.2 23 12 23 12zM9.75 15.27V8.73L15.4 12l-5.65 3.27z",
};

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="grain border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Link
            href="/"
            aria-label="CADD Truck Parking — Home"
            className="card-lift inline-block bg-white px-4 py-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-day.png"
              alt="CADD Truck Parking"
              className="h-16 w-auto"
              loading="lazy"
            />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-neutral-400">{t.footer.tagline}</p>
          <ul className="mt-5 flex items-center gap-3">
            {BUSINESS.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`CADD Truck Parking on ${s.name}`}
                  title={s.name}
                  className="flex size-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-300 transition hover:border-[#e8646b] hover:text-[#e8646b]"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                    <path d={SOCIAL_ICONS[s.name]} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#e8646b]">
            {t.footer.findUs}
          </p>
          <p className="text-neutral-200">{BUSINESS.address}</p>
          <p className="mt-2">
            <a
              href={`tel:+${BUSINESS.phoneTollFreeDial}`}
              className="flex flex-col leading-tight text-neutral-200 hover:text-[#e8646b]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="font-bold">{BUSINESS.phoneTollFreeVanity}</span>
              <span className="text-xs text-neutral-400">{BUSINESS.phoneTollFree}</span>
            </a>
          </p>
          <p className="mt-1">
            <a
              href={`mailto:${BUSINESS.email}`}
              className="inline-flex min-h-6 items-center text-neutral-200 hover:text-[#e8646b]"
            >
              {BUSINESS.email}
            </a>
          </p>
          <p className="mt-2 text-neutral-400">{t.footer.hours}</p>
        </div>

        <div className="text-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#e8646b]">
            {t.footer.quickLinks}
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="/book" className="inline-flex min-h-6 items-center text-neutral-200 hover:text-[#e8646b]">
                {t.footer.linkReserve}
              </Link>
            </li>
            <li>
              <Link href="/#rates" className="inline-flex min-h-6 items-center text-neutral-200 hover:text-[#e8646b]">
                {t.footer.linkRates}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="inline-flex min-h-6 items-center text-neutral-200 hover:text-[#e8646b]">
                {t.nav.blog}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="inline-flex min-h-6 items-center text-neutral-200 hover:text-[#e8646b]">
                {t.footer.linkTerms}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="inline-flex min-h-6 items-center text-neutral-200 hover:text-[#e8646b]">
                {t.footer.linkPrivacy}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-5 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} {BUSINESS.legalName} d/b/a CADD Truck
        Parking · Midland, Texas · {t.footer.rights}
      </div>
    </footer>
  );
}
