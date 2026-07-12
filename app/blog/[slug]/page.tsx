import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import { BUSINESS } from "@/lib/pricing";

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | CADD Truck Parking`,
    description: post.description,
    keywords: post.keywords,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "CADD Truck Parking" },
    publisher: { "@type": "Organization", name: "CADD Truck Parking" },
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/blog"
        className="font-mono text-xs uppercase tracking-[0.25em] text-red hover:underline"
      >
        ← The Driver&rsquo;s Log
      </Link>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-tight text-ink sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-3 font-mono text-xs text-muted">
        {new Date(post.date + "T12:00:00").toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        {" · CADD Truck Parking · Midland, TX"}
      </p>

      <article
        className="blog-prose mt-8"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      <div className="mt-12 rounded-xl border border-line bg-surface2 p-6 text-center">
        <p className="font-display text-2xl font-bold uppercase text-ink">
          Need a safe spot tonight?
        </p>
        <p className="mt-2 text-sm text-muted">
          Fenced, camera-watched, assigned spaces with hot showers &amp; laundry —
          Est. 2018 in the heart of the Permian Basin.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/book"
            className="rounded-lg bg-redsolid px-6 py-3 font-semibold uppercase tracking-wider text-white transition hover:opacity-90"
          >
            Reserve a Space
          </Link>
          <a
            href={`tel:+${BUSINESS.phoneTollFreeDial}`}
            className="rounded-lg border border-line px-6 py-3 font-semibold uppercase tracking-wider text-ink transition hover:border-red"
          >
            Call the Lot
          </a>
        </div>
      </div>
    </main>
  );
}
