# CADD Truck Parking — Website + Reservations

Marketing site and reservation system for CADD Truck Parking (CADD Realty, LLC),
4500 E CR 130, Midland, TX 79706. Built with Next.js + Tailwind.

## What it does

- **Home page** — amenities, both plans with a daily/weekly/monthly/annual rate
  toggle, shower comparison, photo gallery, testimonials, map, CTAs.
- **/book** — 5-step reservation: plan → rate → driver info → **terms
  acceptance with typed e-signature** → payment method.
  - Card payments open a hosted **Square** checkout.
  - Zelle / Cash App / cash / check reservations still record the signed
    acceptance and show a confirmation code + payment instructions.
- **/terms** — full Terms & Conditions, versioned (`lib/terms.ts`).
- **/admin** — password-protected list of every acceptance record + CSV export.
- **/api/reserve** — validates, stores the acceptance record (timestamp, name,
  typed signature, terms version, IP, user agent, payment path), then creates
  the Square payment link if paying by card.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in what you have — everything degrades gracefully
npm run dev
```

Without any env vars: reservations still work; acceptance records go to
`data/acceptances.jsonl`; card option falls back to "pay on arrival".

## Brand, photos & hero video

- **Photos** — drop images into `public/photos/`; the gallery picks them up
  automatically. `hero.jpg` goes behind the homepage headline.
- **Logos** — `public/brand/logo-night.png` (silver, shown on dark) and
  `logo-day.png` (red, shown in day mode). Already in place from the current
  site; replace with higher-res exports anytime.
- **Hero video** — `public/media/hero-loop.mp4` plays muted behind the
  homepage headline. Loop behavior: plays through, **holds the final frame
  for 7 seconds**, then restarts (see `handleVideoEnded` in
  `components/HomeContent.tsx`). To swap the clip, replace the file —
  compress to ≤10 MB first (`avconvert --preset Preset1280x720` works on
  macOS; the current file was compressed from 48 MB to 9.3 MB this way).
- **Show truck / mascot** — `public/brand/show-truck.jpg` powers the
  family-owned brand section; add `public/brand/mascot.png` to show the
  cartoon mascot in the FAQ section.

## Day/night + English/Spanish

Both toggles live in the header. Theme persists in `localStorage`
(`cadd-theme`), language too (`cadd-lang`). All UI strings live in
`lib/i18n.tsx` (American English + Mexican Spanish). The legal T&C document
stays English-only on purpose — the Spanish UI labels it as the governing
English document; every acceptance record stores the language used
(`lang` column/CSV field).

## Square setup (online card payments)

1. Go to https://developer.squareup.com/apps → create an app (or use existing).
2. Copy the **Sandbox** Access Token + Location ID into `.env.local` and set
   `SQUARE_ENV=sandbox`. Test a booking — checkout opens on Square's sandbox.
3. When ready, swap in the **Production** token/location and set
   `SQUARE_ENV=production`.

Payments are one-time links titled e.g. `IronHauler — Monthly Truck Parking
(CADD-XXXXXX)` so each payment matches an acceptance record. (Auto-renewing
monthly billing is a later upgrade via Square's Subscriptions API.)

## Acceptance records in production

Set `DATABASE_URL` to a free [Neon](https://neon.tech) Postgres connection
string — the table is created automatically on first write. On Vercel, the
file fallback is **not durable**, so set this before going live.

Optional: set `RESEND_API_KEY` + `OWNER_EMAIL` to get an email copy of every
signed acceptance.

Set `ADMIN_PASSWORD` to enable `/admin`.

## Deploy (Vercel)

```bash
npx vercel
```

Add the env vars from `.env.example` in the Vercel project settings, and set
`NEXT_PUBLIC_SITE_URL` to the live domain (used for the Square redirect back).

## Legal note

`lib/terms.ts` holds the Terms & Conditions (converted from the original
parking space rental agreement). Bump `TERMS_VERSION` whenever you edit it so
records show exactly which revision each customer accepted. Have a Texas
attorney review before relying on it — this is drafting help, not legal advice.
