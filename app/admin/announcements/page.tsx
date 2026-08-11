import AnnouncementComposer from "@/components/AnnouncementComposer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Weekly Announcement — CADD Truck Parking",
  robots: { index: false, follow: false },
};

export default async function AnnouncementsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const pass = process.env.ADMIN_PASSWORD;
  const authorized = !!pass && key === pass;

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
          Enter the admin password (ADMIN_PASSWORD) to write this week&apos;s
          announcement.
        </p>
        <form method="GET" className="mt-6 flex gap-2">
          <input
            type="password"
            name="key"
            placeholder="Admin password"
            className="w-full border border-line bg-surface1 px-4 py-3 text-ink outline-none focus:border-red"
          />
          <button className="bg-redsolid px-6 py-3 text-sm font-bold uppercase tracking-widest text-white hover:bg-reddeep">
            Open
          </button>
        </form>
        {!pass && (
          <p className="mt-4 text-xs text-red">
            ADMIN_PASSWORD is not set on the server.
          </p>
        )}
      </div>
    );
  }

  return <AnnouncementComposer adminKey={key!} />;
}
