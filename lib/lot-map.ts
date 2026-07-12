/**
 * The CADD lot, digitized from the paper sitemap.
 *
 * Space inventory + SVG geometry for <LotMap/>. Coordinates are in the
 * map's own viewBox units (0 0 900 1560), matching the original drawing:
 * ECR 130 across the top, SCR 1144 down the right, exit gate top-center,
 * east gate mid-right, south gate bottom-right.
 */

export type SpaceStatus = "available" | "held" | "reserved" | "maintenance";

export interface SpaceDef {
  id: string;
  zone: "east" | "west" | "southwest" | "rv";
  /** allocation order — lower allocates first; RV spaces are manual-only */
  sort: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vertical?: boolean;
}

const ROW = 25;

function column(
  ids: string[],
  zone: SpaceDef["zone"],
  x: number,
  y0: number,
  w: number,
): SpaceDef[] {
  return ids.map((id, i) => ({
    id,
    zone,
    sort: id === "50A" ? 50.5 : parseInt(id) || 999,
    x,
    y: y0 + i * ROW,
    w,
    h: ROW - 3,
  }));
}

const range = (a: number, b: number) => {
  const out: string[] = [];
  const step = a <= b ? 1 : -1;
  for (let n = a; step > 0 ? n <= b : n >= b; n += step) out.push(String(n));
  return out;
};

/** West column: 24 at top → 50, then 50A. */
const west = column([...range(24, 50), "50A"], "west", 150, 335, 150);
/** East column: 23 at top → 1 at bottom. */
const east = column(range(23, 1), "east", 560, 335, 150);
/** Southwest column: 66 at top → 51 at bottom. */
const southwest = column(range(66, 51), "southwest", 150, 1120, 150);
/** RV spaces: vertical bars, RV4 leftmost → RV1 rightmost (like the map). */
const rv: SpaceDef[] = ["RV4", "RV3", "RV2", "RV1"].map((id, i) => ({
  id,
  zone: "rv",
  sort: 900 + i, // never auto-allocated
  x: 330 + i * 32,
  y: 1085,
  w: 26,
  h: 62,
  vertical: true,
}));

export const SPACES: SpaceDef[] = [...west, ...east, ...southwest, ...rv];

/** Initial statuses, matching the drawing: numbered = reserved (red),
 *  RV pads = available (green). The admin controls everything after seed. */
export function seedStatus(id: string): SpaceStatus {
  return id.startsWith("RV") ? "available" : "reserved";
}

export const STATUS_COLORS: Record<SpaceStatus, string> = {
  available: "#3fae52",
  held: "#e8a020",
  reserved: "#8a1a35",
  maintenance: "#8a8f98",
};

/** Static furniture on the map (drawn by <LotMap/>). */
export const MAP = {
  viewBox: "0 0 900 1560",
  roads: {
    top: { label: "ECR 130", x: 420, y: 240 },
    right: { label: "SCR 1144", x: 785, y: 620 },
  },
  gates: {
    exit: { label: "EXIT GATE", x: 430, y: 400 },
    east: {
      label: "EAST GATE",
      note: "OPEN BY CALLING (432) 599-0949",
      x: 745,
      y: 975,
    },
    south: { label: "SOUTH GATE", x: 715, y: 1300 },
  },
  buildings: [
    { label: "COMMONS & SHOWERS", x: 470, y: 1008, w: 122, h: 68 },
    { label: "CABIN 1", x: 476, y: 1105, w: 68, h: 26 },
    { label: "SHOP BUILDING", x: 545, y: 1170, w: 80, h: 120 },
  ],
  tanStrips: [
    { label: "Parking", x: 180, y: 283, w: 208, h: 26 },
    { label: "Parking", x: 482, y: 283, w: 218, h: 26 },
    { label: "Parking", x: 296, y: 1046, w: 90, h: 24 },
  ],
  greenStrips: [
    { x: 150, y: 310, w: 150, h: 18 },
    { x: 560, y: 310, w: 150, h: 18 },
    { x: 150, y: 1524, w: 150, h: 18 },
  ],
  pretrip: {
    label: "PRE-TRIP STATIONS",
    squares: [
      { x: 392, y: 985 },
      { x: 430, y: 985 },
      { x: 468, y: 985 },
    ],
  },
  expansion: {
    label: ["New spaces", "expansion plan"],
    x: 430,
    y: 1370,
    w: 230,
    h: 135,
  },
};
