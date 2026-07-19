export type PlanId = "trailblazer" | "ironhauler";
export type TermId = "daily" | "weekly" | "monthly" | "annual";

export interface Term {
  id: TermId;
  label: string;
  unit: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  kicker: string;
  blurb: string;
  showers: string;
  features: string[];
  prices: Record<TermId, number>;
}

export const TERMS_LIST: Term[] = [
  { id: "daily", label: "Daily", unit: "/ day" },
  { id: "weekly", label: "Weekly", unit: "/ week" },
  { id: "monthly", label: "Monthly", unit: "/ month" },
  { id: "annual", label: "Annual", unit: "/ year" },
];

export const PLANS: Plan[] = [
  {
    id: "trailblazer",
    name: "Trailblazer",
    kicker: "The Essentials",
    blurb:
      "A numbered, assigned space inside the fence with full lot access — everything you need to park with peace of mind.",
    showers: "Hot showers available at $1 per minute",
    features: [
      "Assigned, numbered parking space",
      "24/7 gated & fenced access",
      "24/7 camera surveillance",
      "Driver lounge, restrooms & WiFi",
      "Laundry & vending on site",
      "Pre-trip air stations",
      "Hot showers — pay as you go ($1/min)",
    ],
    prices: { daily: 25, weekly: 75, monthly: 180, annual: 1800 },
  },
  {
    id: "ironhauler",
    name: "IronHauler",
    kicker: "The Full Ride",
    blurb:
      "Everything in Trailblazer, plus unlimited hot showers and priority treatment. Built for drivers who live on the road.",
    showers: "Unlimited hot showers included",
    features: [
      "Everything in Trailblazer",
      "UNLIMITED hot showers — no coins, no clock",
      "Priority space assignment",
      "Priority support from the facilities officer",
      "Grill & picnic area access",
      "First call on service-provider referrals",
    ],
    prices: { daily: 40, weekly: 125, monthly: 350, annual: 3500 },
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPrice(planId: string, termId: string): number | undefined {
  const plan = getPlan(planId);
  if (!plan) return undefined;
  if (!TERMS_LIST.some((t) => t.id === termId)) return undefined;
  return plan.prices[termId as TermId];
}

export function formatUSD(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
}

/** Months of monthly price the annual plan saves (2 free months). */
export function annualSavings(plan: Plan): number {
  return plan.prices.monthly * 12 - plan.prices.annual;
}

export const BUSINESS = {
  name: "CADD Truck Parking",
  legalName: "CADD Realty, LLC",
  established: 2018,
  address: "4500 East County Road 130, Midland, TX 79706",
  addressShort: "4500 E CR 130, Midland, TX 79706",
  phoneTollFree: "1-877-607-CADD",
  phoneTollFreeDigits: "1-877-607-2233",
  phoneTollFreeDial: "18776072233",
  phoneLocal: "(325) 450-7486",
  phoneLocalDial: "13254507486",
  email: "caddrealty@gmail.com",
  noticeAddress: "CADD Realty, LLC, 100 Ranger Point, Adkins, TX 78101",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=CADD+Truck+Parking+4500+East+County+Road+130+Midland+TX+79706",
};
