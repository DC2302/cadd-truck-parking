"use client";

/**
 * Admin → weekly announcement.
 *
 * Type it the way you'd say it on the phone; the writer turns it into a
 * headline, body and up to three callouts in English AND Spanish, and picks
 * the artwork. Every field stays editable and nothing goes live until you
 * publish. The preview is the real banner, not an approximation.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bi,
  LIMITS,
  THEMES,
  ThemeId,
  Announcement,
  mondayOf,
  themeById,
  weekLabel,
} from "@/lib/announcements-types";

type Draft = {
  id?: string;
  weekOf: string;
  theme: ThemeId;
  kicker: Bi;
  headline: Bi;
  body: Bi;
  facts: Bi[];
  cta: { label: Bi; href: string } | null;
  request: string;
};

const empty = (): Bi => ({ en: "", es: "" });
const emptyDraft = (): Draft => ({
  weekOf: mondayOf(),
  theme: "driver",
  kicker: empty(),
  headline: empty(),
  body: empty(),
  facts: [],
  cta: null,
  request: "",
});

const CTA_TARGETS: { href: string; label: string }[] = [
  { href: "", label: "No button" },
  { href: "/book", label: "Reserve a space" },
  { href: "/#rates", label: "See rates" },
  { href: "/#amenities", label: "Amenities" },
  { href: "/#location", label: "Location" },
  { href: "/blog", label: "Driver's Log" },
];

const field =
  "w-full border border-line bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-red";
const lbl =
  "mb-1 block text-[0.62rem] font-bold uppercase tracking-widest text-muted";

export default function AnnouncementComposer({ adminKey }: { adminKey: string }) {
  const [list, setList] = useState<Announcement[] | null>(null);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [notLiveReason, setNotLiveReason] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [writerReady, setWriterReady] = useState(false);
  const [db, setDb] = useState<{ backend: string; host?: string } | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [request, setRequest] = useState("");
  const [themeHint, setThemeHint] = useState<"" | ThemeId>("");
  const [previewLang, setPreviewLang] = useState<"en" | "es">("en");
  const [writing, setWriting] = useState(false);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  const api = useCallback(
    async <T,>(body?: unknown): Promise<T> => {
      const url = `/api/admin/announcements?key=${encodeURIComponent(adminKey)}`;
      const res = await fetch(url, {
        method: body ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false)
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      return data as T;
    },
    [adminKey],
  );

  const applyState = (d: {
    announcements?: Announcement[];
    liveId?: string | null;
    notLiveReason?: string | null;
    isDefault?: boolean;
  }) => {
    if (d.announcements) setList(d.announcements);
    if (d.liveId !== undefined) setLiveId(d.liveId);
    if (d.notLiveReason !== undefined) setNotLiveReason(d.notLiveReason);
    if (d.isDefault !== undefined) setIsDefault(d.isDefault);
  };

  useEffect(() => {
    api<{
      announcements: Announcement[];
      liveId: string | null;
      notLiveReason: string | null;
      isDefault: boolean;
      writerReady: boolean;
      db: { backend: string; host?: string };
    }>()
      .then((d) => {
        applyState(d);
        setWriterReady(d.writerReady);
        setDb(d.db);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load"));
  }, [api]);

  const live = useMemo(
    () => (list ?? []).find((a) => a.status === "published"),
    [list],
  );
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const setBi = (k: "kicker" | "headline" | "body", lang: "en" | "es", v: string) =>
    setDraft((d) => ({ ...d, [k]: { ...d[k], [lang]: v } }));

  const write = async () => {
    if (request.trim().length < 8) {
      setErr("Tell it what you want to say — a sentence is plenty.");
      return;
    }
    setWriting(true);
    setErr("");
    setNote("");
    try {
      const d = await api<{ draft: Omit<Draft, "weekOf" | "request">; note?: string }>({
        action: "draft",
        request,
        theme: themeHint || undefined,
      });
      setDraft((prev) => ({ ...prev, ...d.draft, request }));
      if (d.note) setNote(d.note);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not write it");
    } finally {
      setWriting(false);
    }
  };

  const save = async (publish: boolean) => {
    if (!draft.headline.en.trim()) {
      setErr("The banner needs an English headline.");
      return;
    }
    setBusy(publish ? "publish" : "save");
    setErr("");
    try {
      const saved = await api<{ announcement: Announcement } & Record<string, unknown>>({
        ...draft,
        request: draft.request || request,
        by: "Owner",
      });
      applyState(saved as never);
      setDraft((d) => ({ ...d, id: saved.announcement.id }));
      if (publish) {
        const pub = await api<{ liveId: string | null; notLiveReason: string | null }>({
          action: "publish",
          id: saved.announcement.id,
          by: "Owner",
        });
        applyState(pub as never);
        // Say what actually happened, not what we hoped happened.
        setNote(
          pub.liveId === saved.announcement.id
            ? "Published — it is on the site now."
            : `Saved and published, but it is NOT showing yet. ${pub.notLiveReason ?? ""}`,
        );
      } else {
        setNote("Saved as a draft. Nothing is live until you publish it.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy("");
    }
  };

  const act = async (id: string, action: "publish" | "archive") => {
    setBusy(id);
    setErr("");
    try {
      applyState(await api({ action, id, by: "Owner" }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update");
    } finally {
      setBusy("");
    }
  };

  const edit = (a: Announcement) => {
    setDraft({
      id: a.id,
      weekOf: a.weekOf,
      theme: a.theme,
      kicker: a.kicker,
      headline: a.headline,
      body: a.body,
      facts: a.facts ?? [],
      cta: a.cta ?? null,
      request: a.request ?? "",
    });
    setRequest(a.request ?? "");
    setNote("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const t = themeById(draft.theme);
  const L = previewLang;
  const p = (b: Bi) => (L === "es" ? b.es || b.en : b.en);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <div className="border border-line bg-surface1 p-5">
        <h1
          className="text-3xl font-black uppercase text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Weekly Announcement
        </h1>
        <p className="mt-1 text-sm text-muted">
          One message runs at a time, in English and Spanish. Publishing a new
          one retires the last.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          {live && liveId === live.id ? (
            <>
              <span className="bg-green-500/15 px-2.5 py-1 font-bold uppercase tracking-widest text-green-400">
                On the site
              </span>
              <span className="text-ink">{live.headline.en}</span>
              <span className="text-muted">{weekLabel(live.weekOf)}</span>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="font-bold uppercase tracking-widest text-red hover:underline"
              >
                See it →
              </a>
            </>
          ) : live ? (
            <>
              <span className="bg-red-500/15 px-2.5 py-1 font-bold uppercase tracking-widest text-red">
                Published · not showing
              </span>
              <span className="text-ink">{live.headline.en}</span>
              {notLiveReason && <span className="text-muted">{notLiveReason}</span>}
            </>
          ) : isDefault ? (
            <>
              <span className="bg-amber-500/20 px-2.5 py-1 font-bold uppercase tracking-widest text-amber-400">
                Built-in message
              </span>
              <span className="text-muted">{notLiveReason}</span>
            </>
          ) : (
            <span className="text-muted">{notLiveReason ?? "Nothing running."}</span>
          )}
        </div>

        {db && (
          <p className="mt-3 border-t border-line pt-2.5 text-[0.66rem] text-muted">
            Saving to{" "}
            <span className="font-bold text-ink">
              {db.backend === "neon" ? db.host : "temporary file storage (no database!)"}
            </span>{" "}
            · if this doesn&apos;t match what{" "}
            <a
              href="https://caddtruckparking.com/api/announcement"
              target="_blank"
              rel="noreferrer"
              className="text-red hover:underline"
            >
              the live site
            </a>{" "}
            reports, you&apos;re on a preview copy and drivers will never see it.
          </p>
        )}
      </div>

      {/* ── say it ── */}
      <div className="border border-line bg-surface1 p-5">
        <h2 className="text-[0.66rem] font-bold uppercase tracking-widest text-muted">
          Say it however you&apos;d say it
        </h2>
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value.slice(0, LIMITS.request))}
          rows={3}
          placeholder="e.g. big dust storm coming through Thursday, tell drivers to strap down and take it slow on I-20"
          className={`${field} mt-2 resize-y`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-muted">
              Look
            </span>
            <select
              value={themeHint}
              onChange={(e) => setThemeHint(e.target.value as "" | ThemeId)}
              className={field.replace("w-full ", "")}
            >
              <option value="">Pick it for me</option>
              {THEMES.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.label.en}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={write}
            disabled={writing}
            className="bg-redsolid px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-reddeep disabled:opacity-50"
          >
            {writing ? "Writing…" : "Write it in both languages"}
          </button>
          <button
            onClick={() => {
              setDraft(emptyDraft());
              setRequest("");
              setNote("");
            }}
            className="text-xs font-bold uppercase tracking-widest text-muted hover:text-red"
          >
            Start over
          </button>
          {!writerReady && (
            <span className="text-xs text-red">
              Writer off — ANTHROPIC_API_KEY not set. You can still type both by hand.
            </span>
          )}
        </div>
      </div>

      {err && <p className="text-sm font-bold text-red">{err}</p>}
      {note && <p className="text-sm font-bold text-amber-400">{note}</p>}

      {/* ── preview ── */}
      {draft.headline.en && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className={lbl}>Exactly how it will look</p>
            <div className="flex gap-1">
              {(["en", "es"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setPreviewLang(l)}
                  className={`px-3 py-1 text-[0.62rem] font-bold uppercase tracking-widest ${
                    previewLang === l
                      ? "bg-redsolid text-white"
                      : "border border-line text-muted hover:text-ink"
                  }`}
                >
                  {l === "en" ? "English" : "Español"}
                </button>
              ))}
            </div>
          </div>
          <div
            className="relative overflow-hidden border-y-2"
            style={{ background: t.bg, borderColor: `${t.accent}55` }}
          >
            <Image
              src={t.image}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              className="object-cover opacity-80"
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
            <div className="relative flex flex-col gap-5 px-5 py-9 md:flex-row md:items-center md:gap-10">
              <div className="min-w-0 flex-1">
                {p(draft.kicker) && (
                  <p
                    className="text-[0.68rem] font-bold uppercase tracking-[0.18em]"
                    style={{ color: t.accent }}
                  >
                    {p(draft.kicker)}
                  </p>
                )}
                <h2
                  className="mt-2 text-2xl font-black uppercase leading-tight text-white drop-shadow-lg md:text-4xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p(draft.headline)}
                </h2>
                {p(draft.body) && (
                  <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-neutral-200 md:text-base">
                    {p(draft.body)}
                  </p>
                )}
                {draft.facts.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    {draft.facts.map((f, i) =>
                      p(f) ? (
                        <span
                          key={i}
                          className="border bg-black/40 px-3 py-1.5 text-xs font-semibold text-white"
                          style={{ borderColor: `${t.accent}88` }}
                        >
                          {p(f)}
                        </span>
                      ) : null,
                    )}
                  </div>
                )}
              </div>
              {draft.cta && p(draft.cta.label) && (
                <span
                  className="shrink-0 px-6 py-3 text-xs font-bold uppercase tracking-widest"
                  style={{ background: t.accent, color: t.ink }}
                >
                  {p(draft.cta.label)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── fine-tune ── */}
      <div className="border border-line bg-surface1 p-5">
        <h2 className="mb-4 text-[0.66rem] font-bold uppercase tracking-widest text-muted">
          Fine-tune — change anything before it goes up
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className={lbl}>Week of (Monday)</span>
            <input
              type="date"
              value={draft.weekOf}
              onChange={(e) => set("weekOf", e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className={lbl}>Look</span>
            <select
              value={draft.theme}
              onChange={(e) => set("theme", e.target.value as ThemeId)}
              className={field}
            >
              {THEMES.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.label.en} — {th.use.slice(0, 44)}…
                </option>
              ))}
            </select>
          </label>

          {(
            [
              ["kicker", "Kicker (small line on top)", LIMITS.kicker],
              ["headline", "Headline", LIMITS.headline],
              ["body", "Body", LIMITS.body],
            ] as const
          ).map(([k, label, max]) => (
            <div key={k} className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className={lbl}>{label} — English</span>
                {k === "body" ? (
                  <textarea
                    rows={2}
                    value={draft[k].en}
                    onChange={(e) => setBi(k, "en", e.target.value.slice(0, max))}
                    className={`${field} resize-y`}
                  />
                ) : (
                  <input
                    value={draft[k].en}
                    onChange={(e) => setBi(k, "en", e.target.value.slice(0, max))}
                    className={field}
                  />
                )}
              </label>
              <label className="block">
                <span className={lbl}>{label} — Español</span>
                {k === "body" ? (
                  <textarea
                    rows={2}
                    value={draft[k].es}
                    onChange={(e) => setBi(k, "es", e.target.value.slice(0, max))}
                    className={`${field} resize-y`}
                  />
                ) : (
                  <input
                    value={draft[k].es}
                    onChange={(e) => setBi(k, "es", e.target.value.slice(0, max))}
                    className={field}
                  />
                )}
              </label>
            </div>
          ))}

          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-2 gap-3 md:col-span-2">
              <label className="block">
                <span className={lbl}>Callout {i + 1} — English</span>
                <input
                  value={draft.facts[i]?.en ?? ""}
                  onChange={(e) => {
                    const facts = [...draft.facts];
                    facts[i] = { ...(facts[i] ?? empty()), en: e.target.value.slice(0, LIMITS.fact) };
                    set("facts", facts);
                  }}
                  className={field}
                />
              </label>
              <label className="block">
                <span className={lbl}>Callout {i + 1} — Español</span>
                <input
                  value={draft.facts[i]?.es ?? ""}
                  onChange={(e) => {
                    const facts = [...draft.facts];
                    facts[i] = { ...(facts[i] ?? empty()), es: e.target.value.slice(0, LIMITS.fact) };
                    set("facts", facts);
                  }}
                  className={field}
                />
              </label>
            </div>
          ))}

          <label className="block">
            <span className={lbl}>Button</span>
            <select
              value={draft.cta?.href ?? ""}
              onChange={(e) => {
                const target = CTA_TARGETS.find((c) => c.href === e.target.value);
                set(
                  "cta",
                  target?.href
                    ? {
                        href: target.href,
                        label: draft.cta?.label?.en
                          ? draft.cta.label
                          : { en: target.label, es: target.label },
                      }
                    : null,
                );
              }}
              className={field}
            >
              {CTA_TARGETS.map((c) => (
                <option key={c.href} value={c.href}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          {draft.cta && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={lbl}>Button — EN</span>
                <input
                  value={draft.cta.label.en}
                  onChange={(e) =>
                    set("cta", {
                      href: draft.cta!.href,
                      label: { ...draft.cta!.label, en: e.target.value.slice(0, 28) },
                    })
                  }
                  className={field}
                />
              </label>
              <label className="block">
                <span className={lbl}>Button — ES</span>
                <input
                  value={draft.cta.label.es}
                  onChange={(e) =>
                    set("cta", {
                      href: draft.cta!.href,
                      label: { ...draft.cta!.label, es: e.target.value.slice(0, 28) },
                    })
                  }
                  className={field}
                />
              </label>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={() => save(true)}
            disabled={!!busy}
            className="bg-redsolid px-6 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-reddeep disabled:opacity-50"
          >
            {busy === "publish" ? "Publishing…" : "Publish to the site"}
          </button>
          <button
            onClick={() => save(false)}
            disabled={!!busy}
            className="border border-line px-4 py-3 text-xs font-bold uppercase tracking-widest text-ink hover:border-red disabled:opacity-50"
          >
            {busy === "save" ? "Saving…" : "Save as draft"}
          </button>
        </div>
      </div>

      {/* ── history ── */}
      <div className="border border-line bg-surface1 p-5">
        <h2 className="mb-3 text-[0.66rem] font-bold uppercase tracking-widest text-muted">
          Past &amp; upcoming
        </h2>
        {!list ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted">Nothing yet — write the first one above.</p>
        ) : (
          <ul className="divide-y divide-line">
            {list.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <span
                  className="h-8 w-1 shrink-0"
                  style={{ background: themeById(a.theme).accent }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">
                    {a.headline.en}
                  </span>
                  <span className="text-xs text-muted">
                    {weekLabel(a.weekOf)} · {themeById(a.theme).label.en}
                  </span>
                </span>
                <span
                  className={`shrink-0 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-widest ${
                    a.status === "published"
                      ? "bg-green-500/15 text-green-400"
                      : a.status === "draft"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-neutral-500/20 text-muted"
                  }`}
                >
                  {a.status}
                </span>
                <button
                  onClick={() => edit(a)}
                  className="shrink-0 text-xs font-bold uppercase tracking-widest text-ink hover:text-red"
                >
                  Edit
                </button>
                {a.status !== "published" ? (
                  <button
                    onClick={() => act(a.id, "publish")}
                    disabled={busy === a.id}
                    className="shrink-0 text-xs font-bold uppercase tracking-widest text-red hover:underline disabled:opacity-50"
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    onClick={() => act(a.id, "archive")}
                    disabled={busy === a.id}
                    className="shrink-0 text-xs font-bold uppercase tracking-widest text-muted hover:text-red disabled:opacity-50"
                  >
                    Take down
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
