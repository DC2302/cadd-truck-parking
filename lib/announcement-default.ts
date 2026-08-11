import type { Announcement } from "@/lib/announcements-types";

/**
 * The built-in announcement.
 *
 * The site should never show an empty strip just because nobody got to the
 * admin this week. This one ships in the code, so it is live the moment the
 * site deploys — no database, no publishing step. Anything published from
 * /admin/announcements replaces it immediately.
 *
 * It retires itself on `DEFAULT_UNTIL`: a stale banner is worse than none,
 * and the whole point of the rotation is that drivers see something current.
 * Move the date forward, or better, publish a real one.
 */

export const DEFAULT_UNTIL = "2026-12-31";

export const DEFAULT_ANNOUNCEMENT: Announcement = {
  id: "default",
  weekOf: "2026-01-01",
  status: "published",
  theme: "driver",
  kicker: {
    en: "MIDLAND · PERMIAN BASIN · EST. 2018",
    es: "MIDLAND · CUENCA PÉRMICA · DESDE 2018",
  },
  headline: {
    en: "Safe travels out there. Your space is waiting.",
    es: "Buen viaje. Su espacio lo está esperando.",
  },
  body: {
    en: "Fenced, lit, and camera-watched, with hot showers and a real driver lounge — open 24/7 to owner-operators and fleets running the Permian.",
    es: "Cercado, iluminado y con cámaras, con duchas calientes y una sala de descanso de verdad — abierto 24/7 para operadores y flotas de la Pérmica.",
  },
  facts: [
    { en: "24/7 lot access", es: "Acceso 24/7 al lote" },
    { en: "Assigned numbered spaces", es: "Espacios numerados asignados" },
    { en: "Hot showers & laundry", es: "Duchas calientes y lavandería" },
  ],
  cta: {
    label: { en: "Reserve a space", es: "Reservar espacio" },
    href: "/book",
  },
  request: "Built-in welcome message.",
  createdBy: "CADD",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export function defaultAnnouncement(today: string): Announcement | null {
  return today <= DEFAULT_UNTIL ? DEFAULT_ANNOUNCEMENT : null;
}
