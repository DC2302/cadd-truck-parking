import { promises as fs } from "fs";
import path from "path";

/**
 * Zero-dependency blog store.
 * Posts live in content/blog/<slug>.md as:
 *   ---
 *   title: ...
 *   date: 2026-07-08
 *   description: ...
 *   keywords: a, b, c
 *   ---
 *   <p>HTML body…</p>
 * The body is trusted, locally-authored HTML (written by OSO's blog agent,
 * reviewed before commit) — never user-submitted content.
 */
export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  keywords: string[];
  html: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parse(slug: string, raw: string): BlogPost {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  let body = raw;
  if (m) {
    body = m[2];
    for (const line of m[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    description: meta.description ?? "",
    keywords: (meta.keywords ?? "").split(",").map((k) => k.trim()).filter(Boolean),
    html: body.trim(),
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  let files: string[] = [];
  try {
    files = (await fs.readdir(BLOG_DIR)).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
  const posts = await Promise.all(
    files.map(async (f) =>
      parse(f.replace(/\.md$/, ""), await fs.readFile(path.join(BLOG_DIR, f), "utf8")),
    ),
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const raw = await fs.readFile(path.join(BLOG_DIR, `${slug}.md`), "utf8");
    return parse(slug, raw);
  } catch {
    return null;
  }
}
