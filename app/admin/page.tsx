import { listAcceptances } from "@/lib/store";
import { formatUSD } from "@/lib/pricing";

import { isAdminKey } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Acceptance Records — CADD Truck Parking",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const pass = process.env.ADMIN_PASSWORD;
  const authorized = isAdminKey(key);

  if (!authorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-24">
        <h1
          className="text-4xl font-black uppercase text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Owner Login
        </h1>
        <p className="mt-3 text-sm text-muted">
          Enter the admin password set in your environment
          (ADMIN_PASSWORD) to view signed acceptance records.
        </p>
        <form method="GET" className="mt-6 flex gap-2">
          <input
            type="password"
            name="key"
            placeholder="Admin password"
            className="w-full border border-line bg-surface1 px-4 py-3 text-ink outline-none focus:border-red"
          />
          <button className="bg-redsolid px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-reddeep">
            View
          </button>
        </form>
        {!pass && (
          <p className="mt-4 text-xs text-red">
            ADMIN_PASSWORD is not set on the server — set it in .env.local (or
            your Vercel project settings) to enable this page.
          </p>
        )}
      </div>
    );
  }

  const records = await listAcceptances();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-5xl font-black uppercase text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Acceptance Records
          </h1>
          <p className="mt-2 text-sm text-muted">
            {records.length} signed acceptance{records.length === 1 ? "" : "s"}{" "}
            on file. Every record notes the terms version, timestamp, typed
            signature, IP, and payment path.
          </p>
        </div>
        <div className="flex gap-3">
        <a
          href={`/admin/announcements?key=${encodeURIComponent(key!)}`}
          className="rounded-lg border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-widest text-ink hover:border-red hover:text-red"
        >
          Announcement
        </a>
        <a
          href={`/admin/spaces?key=${encodeURIComponent(key!)}`}
          className="rounded-lg border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-widest text-ink hover:border-red hover:text-red"
        >
          Space Map
        </a>
        <a
          href={`/api/admin/export?key=${encodeURIComponent(key!)}`}
          className="bg-redsolid px-5 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-reddeep"
        >
          Download CSV
        </a>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr
              className="border-b border-line bg-surface1 text-xs uppercase tracking-wider text-muted"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <th className="px-4 py-3">Confirmation</th>
              <th className="px-4 py-3">When (UTC)</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Signature</th>
              <th className="px-4 py-3">Space</th>
              <th className="px-4 py-3">Lang</th>
              <th className="px-4 py-3">Terms ver.</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-muted">
                  No records yet. They'll appear here the moment someone
                  accepts the terms on /book.
                </td>
              </tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-b border-line/50 text-ink">
                <td
                  className="px-4 py-3 font-bold text-red"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {r.id}
                </td>
                <td className="px-4 py-3 text-muted">
                  {r.createdAt.replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-4 py-3">
                  {r.name}
                  {r.company && (
                    <span className="block text-xs text-muted">{r.company}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {r.email}
                  <span className="block text-xs">{r.phone}</span>
                </td>
                <td className="px-4 py-3">
                  {r.plan}
                  <span className="block text-xs uppercase text-muted">
                    {r.term}
                  </span>
                </td>
                <td className="px-4 py-3">{formatUSD(r.priceUsd)}</td>
                <td className="px-4 py-3">
                  <span className="uppercase">{r.paymentMethod}</span>
                  <span className="block text-xs text-muted">
                    {r.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 italic">{r.signature}</td>
                <td className="px-4 py-3 font-bold text-red">
                  {r.space ? `#${r.space}` : "—"}
                </td>
                <td className="px-4 py-3 uppercase text-muted">
                  {r.lang ?? "en"}
                </td>
                <td
                  className="px-4 py-3 text-xs text-muted"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {r.termsVersion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
