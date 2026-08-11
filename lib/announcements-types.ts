/**
 * Weekly announcement — shapes, themes, and week math.
 *
 * PURE MODULE: no storage imports, so the public banner and the admin
 * composer can both use it. Persistence lives in lib/announcements.ts.
 *
 * Bilingual by design. This site is English + Spanish everywhere else, and a
 * banner that only speaks English would be the one thing on the page a
 * Spanish-speaking driver can't read. Every text field carries both; the
 * banner shows whichever language the visitor is browsing in.
 */

export type Lang = "en" | "es";

/** A string in both languages. Spanish falls back to English if left blank. */
export interface Bi {
  en: string;
  es: string;
}

export const pick = (b: Bi | undefined, lang: Lang): string =>
  !b ? "" : lang === "es" ? b.es || b.en : b.en;

export type ThemeId =
  | "weather"
  | "road"
  | "holiday"
  | "amenity"
  | "special"
  | "driver";

export interface Theme {
  id: ThemeId;
  label: Bi;
  /** What this theme is for — shown in the picker and given to the writer. */
  use: string;
  accent: string;
  ink: string;
  bg: string;
  image: string;
}

/**
 * Themes are the things a truck lot actually needs to tell drivers, not a
 * generic set: weather that changes how you drive, the road in and out,
 * holiday hours, the amenities, a rate, and the drivers themselves.
 */
export const THEMES: Theme[] = [
  {
    id: "weather",
    label: { en: "Weather Alert", es: "Alerta del Clima" },
    use: "Dust storms, ice, high wind, hail, heat — anything that changes how drivers should run this week",
    accent: "#e8646b",
    ink: "#17181c",
    bg: "#1b1013",
    image: "/announcements/weather.jpg",
  },
  {
    id: "road",
    label: { en: "Road & Access", es: "Carretera y Acceso" },
    use: "I-20, SH 158, construction, detours, gate access, or anything affecting the drive in and out of the lot",
    accent: "#e6a23c",
    ink: "#17181c",
    bg: "#1a150e",
    image: "/announcements/road.jpg",
  },
  {
    id: "holiday",
    label: { en: "Holiday & Hours", es: "Días Festivos y Horario" },
    use: "Holiday hours, office closures, seasonal greetings to the drivers staying over",
    accent: "#d8dbe0",
    ink: "#17181c",
    bg: "#101822",
    image: "/announcements/holiday.jpg",
  },
  {
    id: "amenity",
    label: { en: "Lot & Amenities", es: "El Lote y Servicios" },
    use: "Showers, laundry, the lounge, vending, lighting, fencing, cameras — improvements and temporary outages",
    accent: "#5bb8a8",
    ink: "#17181c",
    bg: "#0d1a19",
    image: "/announcements/amenity.jpg",
  },
  {
    id: "special",
    label: { en: "Rates & Specials", es: "Tarifas y Ofertas" },
    use: "A rate, a fleet or group deal, a limited-time offer on parking",
    accent: "#e8646b",
    ink: "#17181c",
    bg: "#180d10",
    image: "/announcements/special.jpg",
  },
  {
    id: "driver",
    label: { en: "Driver Appreciation", es: "Reconocimiento al Conductor" },
    use: "Thank-yous, driver appreciation, safe-travels messages, community notes",
    accent: "#e8a44c",
    ink: "#17181c",
    bg: "#16110c",
    image: "/announcements/driver.jpg",
  },
];

export const themeById = (id: string | undefined): Theme =>
  THEMES.find((t) => t.id === id) ?? THEMES[5];

export type AnnouncementStatus = "draft" | "published" | "archived";

export interface Announcement {
  id: string;
  /** Monday of the week this runs, YYYY-MM-DD. */
  weekOf: string;
  status: AnnouncementStatus;
  theme: ThemeId;
  kicker: Bi;
  headline: Bi;
  body: Bi;
  /** Up to three short callouts. */
  facts: Bi[];
  cta?: { label: Bi; href: string } | null;
  /** What the owner actually typed, kept for reference and re-runs. */
  request: string;
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}

/** Monday of the week containing `d` (local calendar), as YYYY-MM-DD. */
export function mondayOf(d: Date = new Date()): string {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const back = (c.getDay() + 6) % 7; // getDay(): 0 = Sunday
  c.setDate(c.getDate() - back);
  return ymd(c);
}

export const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

export const todayYmd = (now: Date = new Date()) => ymd(now);

/** Monday of the week containing a YYYY-MM-DD string. */
export function mondayOfYmd(s: string): string {
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return mondayOf();
  return mondayOf(new Date(y, m - 1, d));
}

export function weekLabel(s: string, lang: Lang = "en"): string {
  const [y, m, d] = s.split("-").map(Number);
  if (!y) return s;
  const date = new Date(y, m - 1, d).toLocaleDateString(
    lang === "es" ? "es-MX" : "en-US",
    { month: "short", day: "numeric" },
  );
  return lang === "es" ? `Semana del ${date}` : `Week of ${date}`;
}

/** A banner nobody refreshed is worse than none — it drops off after this. */
export const STALE_AFTER_DAYS = 13;

export function isStale(weekOf: string, today = new Date()): boolean {
  const [y, m, d] = weekOf.split("-").map(Number);
  if (!y) return true;
  const age = (today.getTime() - new Date(y, m - 1, d).getTime()) / 86_400_000;
  return age > STALE_AFTER_DAYS;
}

export const LIMITS = {
  kicker: 46,
  headline: 76,
  body: 210,
  fact: 40,
  facts: 3,
  request: 600,
};

export const clampText = (s: unknown, max: number) =>
  String(s ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export const clampBi = (b: unknown, max: number): Bi => {
  const o = (b ?? {}) as Partial<Bi>;
  return { en: clampText(o.en, max), es: clampText(o.es, max) };
};
