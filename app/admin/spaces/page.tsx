"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LotMap from "@/components/LotMap";
import { SpaceStatus, STATUS_COLORS } from "@/lib/lot-map";
import type { SpaceRecord } from "@/lib/spaces-store";

const STATUSES: SpaceStatus[] = ["available", "held", "reserved", "maintenance"];

function SpacesAdmin() {
  const key = useSearchParams().get("key") || "";
  const [spaces, setSpaces] = useState<SpaceRecord[]>([]);
  const [summary, setSummary] = useState<{
    truckTotal: number;
    truckAvailable: number;
    nextSpace: string;
    rvAvailable: number;
    held: number;
  } | null>(null);
  const [persistent, setPersistent] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/spaces?key=${encodeURIComponent(key)}`);
    if (!res.ok) {
      setErr(res.status === 401 ? "Wrong or missing admin key." : "Couldn't load spaces.");
      return;
    }
    const json = await res.json();
    setSpaces(json.spaces);
    setSummary(json.summary);
    setPersistent(json.persistent);
    setErr("");
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  const sel = spaces.find((s) => s.id === selected) ?? null;

  async function patch(update: Record<string, string>) {
    if (!sel) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/spaces?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sel.id, ...update }),
      });
      if (res.ok) await load();
    } finally {
      setSaving(false);
    }
  }

  if (err) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <h1 className="text-4xl font-black uppercase text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Space Map
        </h1>
        <p className="mt-3 text-sm text-red">{err}</p>
        <p className="mt-2 text-sm text-muted">
          Open this page as <code>/admin/spaces?key=YOUR_ADMIN_PASSWORD</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black uppercase text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Space Map
          </h1>
          {summary && (
            <p className="mt-2 text-sm text-muted">
              <strong className="text-[color:#3fae52]">{summary.truckAvailable}</strong> of{" "}
              {summary.truckTotal} truck spaces available
              {summary.nextSpace && <> · next auto-assign: <strong className="text-ink">#{summary.nextSpace}</strong></>}
              {" "}· {summary.held} held · {summary.rvAvailable} RV pads open
            </p>
          )}
          {!persistent && (
            <p className="mt-1 text-xs font-semibold text-red">
              ⚠ Running on temporary storage — statuses reset on redeploy. Add DATABASE_URL (Neon) to make this permanent.
            </p>
          )}
        </div>
        <Link
          href={`/admin?key=${encodeURIComponent(key)}`}
          className="rounded-lg border-2 border-line px-4 py-2 text-sm font-bold uppercase tracking-wider text-ink hover:border-red hover:text-red"
        >
          ← Reservations
        </Link>
      </div>

      {/* legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-muted">
        {STATUSES.map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm" style={{ background: STATUS_COLORS[s] }} />
            {s}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card-lift-featured overflow-hidden">
          <LotMap
            statuses={Object.fromEntries(spaces.map((s) => [s.id, s.status]))}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* editor panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-lift border border-line bg-surface1 p-5">
            {!sel ? (
              <p className="text-sm text-muted">
                Click any space on the map to change its status or assign it to a driver.
              </p>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Space</p>
                <p className="text-5xl font-black text-ink" style={{ fontFamily: "var(--font-display)" }}>
                  {sel.id}
                </p>

                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted">Status</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      disabled={saving}
                      onClick={() => patch({ status: s })}
                      className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition disabled:opacity-50 ${
                        sel.status === s ? "ring-2 ring-ink" : "opacity-75 hover:opacity-100"
                      }`}
                      style={{ background: STATUS_COLORS[s] }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    void patch({
                      assignedTo: String(fd.get("assignedTo") ?? ""),
                      confirmation: String(fd.get("confirmation") ?? ""),
                      note: String(fd.get("note") ?? ""),
                    });
                  }}
                >
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted">
                    Assigned to
                    <input
                      name="assignedTo"
                      key={`${sel.id}-name`}
                      defaultValue={sel.assignedTo}
                      className="mt-1 w-full rounded-lg border border-line bg-surface0 px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-red"
                    />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted">
                    Confirmation code
                    <input
                      name="confirmation"
                      key={`${sel.id}-conf`}
                      defaultValue={sel.confirmation}
                      className="mt-1 w-full rounded-lg border border-line bg-surface0 px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-red"
                      style={{ fontFamily: "var(--font-mono)" }}
                    />
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted">
                    Note
                    <input
                      name="note"
                      key={`${sel.id}-note`}
                      defaultValue={sel.note}
                      className="mt-1 w-full rounded-lg border border-line bg-surface0 px-3 py-2 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-red"
                    />
                  </label>
                  <button
                    disabled={saving}
                    className="w-full rounded-lg bg-redsolid py-2.5 text-sm font-bold uppercase tracking-widest text-white transition enabled:hover:bg-reddeep disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save details"}
                  </button>
                </form>

                {sel.status === "held" && (
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    Held by a new reservation ({sel.confirmation || "no code"}). Verify payment,
                    then mark <strong>reserved</strong> — or <strong>available</strong> to release it.
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SpacesAdminPage() {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Loading…</p>}>
      <SpacesAdmin />
    </Suspense>
  );
}
