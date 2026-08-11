"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

/**
 * Branded 404. The previous site ran for ~7 years, so stale links are still out
 * there in Google, directories, and drivers' bookmarks — this turns those dead
 * ends into a booking instead of Next.js's bare default page.
 */
export default function NotFound() {
  const { t } = useLang();
  return (
    <section className="grain bg-surface0 py-28">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-red">
          {t.notFound.kicker}
        </p>
        <h1
          className="mt-3 text-6xl font-black uppercase leading-[0.95] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.notFound.title}
        </h1>
        <p className="mx-auto mt-5 max-w-lg leading-relaxed text-muted">
          {t.notFound.body}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/book"
            className="rounded-lg bg-redsolid px-7 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:bg-reddeep"
          >
            {t.notFound.book}
          </Link>
          <Link
            href="/"
            className="rounded-lg border-2 border-ink/40 px-7 py-4 text-sm font-bold uppercase tracking-widest text-ink transition hover:border-red hover:text-red"
          >
            {t.notFound.home}
          </Link>
          <a
            href={`tel:+${BUSINESS.phoneTollFreeDial}`}
            className="inline-flex min-h-6 items-center text-sm font-bold uppercase tracking-widest text-red transition hover:text-ink"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {BUSINESS.phoneTollFreeVanity}
          </a>
        </div>
      </div>
    </section>
  );
}
