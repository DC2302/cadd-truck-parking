import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { BUSINESS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Driver's Log — Permian Basin Trucking | CADD",
  description:
    "Straight talk for truckers in the Permian Basin: parking, regulations, life on the road, and getting the most out of every stop. From the crew at CADD Truck Parking, Midland TX.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-red">
        The Driver&rsquo;s Log
      </p>
      <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-tight text-ink sm:text-5xl">
        Straight talk from the lot
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Parking, rules of the road, and Permian Basin trucking life — written by the
        people who run the lot, for the people who run the roads.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href="/book"
          className="rounded-lg bg-redsolid px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-reddeep"
        >
          Reserve a space
        </Link>
        <a
          href={`tel:+${BUSINESS.phoneTollFreeDial}`}
          className="rounded-lg border-2 border-ink/30 px-5 py-3 text-sm font-bold uppercase tracking-widest text-ink transition hover:border-red hover:text-red"
        >
          {BUSINESS.phoneTollFreeVanity}
        </a>
      </div>

      <div className="mt-10 space-y-6">
        {posts.length === 0 && (
          <p className="text-muted">First post rolling in soon. Check back.</p>
        )}
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="block rounded-xl border border-line bg-surface2 p-6 transition hover:border-red"
          >
            <p className="font-mono text-xs text-muted">
              {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold uppercase text-ink">
              {p.title}
            </h2>
            <p className="mt-2 text-sm text-muted">{p.description}</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-red">
              Read it →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
