"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { BUSINESS } from "@/lib/pricing";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const MAX_USER_MESSAGES = 30; // per session, keeps API costs sane

/** Parse CTA tokens out of a bot reply → clean text + buttons. */
function splitReply(text: string): {
  text: string;
  ctas: { kind: "book" | "terms" | "call"; href: string }[];
} {
  const ctas: { kind: "book" | "terms" | "call"; href: string }[] = [];
  const clean = text
    .replace(/\[\[book(?::(trailblazer|ironhauler):(daily|weekly|monthly|annual))?\]\]/gi, (_, plan, term) => {
      ctas.push({
        kind: "book",
        href: plan ? `/book?plan=${plan}&term=${term}` : "/book",
      });
      return "";
    })
    .replace(/\[\[terms\]\]/gi, () => {
      ctas.push({ kind: "terms", href: "/terms" });
      return "";
    })
    .replace(/\[\[call\]\]/gi, () => {
      ctas.push({ kind: "call", href: `tel:+${BUSINESS.phoneTollFreeDial}` });
      return "";
    })
    .replace(/\[\[[^\]]*\]\]/g, "") // strip anything unknown
    .trim();
  return { text: clean, ctas: ctas.slice(0, 2) };
}

export default function ChatWidget() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy, open]);

  const userCount = messages.filter((m) => m.role === "user").length;

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || userCount >= MAX_USER_MESSAGES) return;
    setError(false);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      const json = await res.json();
      if (!res.ok || !json.reply) throw new Error("chat failed");
      setMessages((m) => [...m, { role: "assistant", content: json.reply }]);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* ── Panel ── */}
      {open && (
        <div className="flex h-[min(560px,calc(100dvh-7rem))] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface0 shadow-[0_8px_20px_rgba(0,0,0,0.25),0_24px_60px_rgba(0,0,0,0.35)]">
          {/* header */}
          <div className="flex items-center gap-3 bg-redsolid px-4 py-3 text-white">
            <span className="block size-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/mascots/point-right.png"
                alt=""
                className="h-16 w-auto -translate-x-1 translate-y-0.5 object-cover"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-lg font-bold uppercase leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t.chat.title}
              </p>
              <p className="truncate text-xs text-white/80">{t.chat.subtitle}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* messages */}
          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            <Bubble role="assistant">{t.chat.greeting}</Bubble>

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-redsolid px-3.5 py-2 text-sm text-white">
                    {m.content}
                  </div>
                </div>
              ) : (
                <BotMessage key={i} raw={m.content} t={t} />
              ),
            )}

            {busy && (
              <p className="px-1 text-xs italic text-muted">{t.chat.thinking}</p>
            )}
            {error && (
              <p className="px-1 text-xs font-semibold text-red">{t.chat.error}</p>
            )}

            {/* quick chips on a fresh conversation */}
            {messages.length === 0 && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {t.chat.chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-full border border-line bg-surface1 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-red hover:text-red"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-line p-3"
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chat.placeholder}
                maxLength={500}
                className="w-full rounded-lg border border-line bg-surface1 px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none transition focus:border-red"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-lg bg-redsolid px-4 text-sm font-bold uppercase tracking-wider text-white transition enabled:hover:bg-reddeep disabled:opacity-40"
              >
                {t.chat.send}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-snug text-muted">
              {t.chat.disclaimer}
            </p>
          </form>
        </div>
      )}

      {/* ── Launcher ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t.chat.open}
        className="group flex items-center gap-2 rounded-full bg-redsolid py-2 pl-2 pr-5 text-white shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:bg-reddeep hover:shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
      >
        <span className="block size-11 overflow-hidden rounded-full bg-white ring-2 ring-white/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascots/thumbs-up.png"
            alt=""
            className="h-[4.5rem] w-auto -translate-x-1.5 translate-y-0.5 object-cover"
          />
        </span>
        <span
          className="text-base font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {open ? "✕" : t.chat.open}
        </span>
      </button>
    </div>
  );
}

function Bubble({ children, role }: { children: React.ReactNode; role: string }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex"}>
      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-surface1 px-3.5 py-2 text-sm leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}

/** Render **bold** spans from the model as real <strong> tags. */
function renderBold(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i}>{p}</strong> : p,
  );
}

function BotMessage({
  raw,
  t,
}: {
  raw: string;
  t: { chat: { bookBtn: string; termsBtn: string; callBtn: string } };
}) {
  const { text, ctas } = splitReply(raw);
  const labels = {
    book: t.chat.bookBtn,
    terms: t.chat.termsBtn,
    call: t.chat.callBtn,
  } as const;
  return (
    <div className="space-y-2">
      {text && <Bubble role="assistant">{renderBold(text)}</Bubble>}
      {ctas.map((c, i) =>
        c.kind === "call" ? (
          <a
            key={i}
            href={c.href}
            className="ml-1 inline-block rounded-lg border-2 border-redsolid px-4 py-2 text-xs font-bold uppercase tracking-wider text-red transition hover:bg-redsolid hover:text-white"
          >
            {labels[c.kind]}
          </a>
        ) : (
          <Link
            key={i}
            href={c.href}
            className="ml-1 inline-block rounded-lg bg-redsolid px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition hover:bg-reddeep"
          >
            {labels[c.kind]}
          </Link>
        ),
      )}
    </div>
  );
}
