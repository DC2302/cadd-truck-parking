"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

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
        </div>

        <div className="text-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#d2343c]">
            {t.footer.findUs}
          </p>
          <p className="text-neutral-200">{BUSINESS.address}</p>
          <p className="mt-2">
            <a
              href={`tel:+${BUSINESS.phoneTollFreeDial}`}
              className="text-neutral-200 hover:text-[#d2343c]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {BUSINESS.phoneTollFree}
            </a>
          </p>
          <p>
            <a
              href={`tel:+${BUSINESS.phoneLocalDial}`}
              className="text-neutral-200 hover:text-[#d2343c]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {BUSINESS.phoneLocal}
            </a>
          </p>
          <p className="mt-1">
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-neutral-200 hover:text-[#d2343c]"
            >
              {BUSINESS.email}
            </a>
          </p>
          <p className="mt-2 text-neutral-500">{t.footer.hours}</p>
        </div>

        <div className="text-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#d2343c]">
            {t.footer.quickLinks}
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="/book" className="text-neutral-200 hover:text-[#d2343c]">
                {t.footer.linkReserve}
              </Link>
            </li>
            <li>
              <Link href="/#rates" className="text-neutral-200 hover:text-[#d2343c]">
                {t.footer.linkRates}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-neutral-200 hover:text-[#d2343c]">
                {t.nav.blog}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-neutral-200 hover:text-[#d2343c]">
                {t.footer.linkTerms}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {BUSINESS.legalName} d/b/a CADD Truck
        Parking · Midland, Texas · {t.footer.rights}
      </div>
    </footer>
  );
}
