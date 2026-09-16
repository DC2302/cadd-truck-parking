import type { NextConfig } from "next";

/**
 * Permanent redirects from the previous WordPress site's URLs.
 *
 * These paths are still in Google's index after ~7 years and were landing on
 * 404s, which throws away their accumulated ranking history and drops anyone
 * arriving from a search result. 301 hands that equity to the closest new page.
 * Anything not listed here is caught by app/not-found.tsx.
 */
const LEGACY_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/about-us", destination: "/" },
  { source: "/about", destination: "/" },
  { source: "/contact-us", destination: "/#location" },
  { source: "/contact", destination: "/#location" },
  { source: "/testimonials", destination: "/#testimonials" },
  { source: "/reviews", destination: "/#testimonials" },
  { source: "/amenities", destination: "/#amenities" },
  // "Our Facility" is still a Google sitelink pointing at the old /gallery page.
  { source: "/gallery", destination: "/#gallery" },
  { source: "/photos", destination: "/#gallery" },
  { source: "/our-facility", destination: "/#gallery" },
  { source: "/facility", destination: "/#gallery" },
  { source: "/services", destination: "/#amenities" },
  { source: "/showers", destination: "/#amenities" },
  { source: "/shower", destination: "/#amenities" },
  { source: "/location", destination: "/#location" },
  { source: "/directions", destination: "/#location" },
  { source: "/faqs", destination: "/#faq" },
  { source: "/faq", destination: "/#faq" },
  { source: "/rates", destination: "/#rates" },
  { source: "/pricing", destination: "/#rates" },
  { source: "/reserve-your-space", destination: "/book" },
  { source: "/reserve-a-space-today", destination: "/book" },
  { source: "/reserve-a-space", destination: "/book" },
  { source: "/reserve", destination: "/book" },
  { source: "/book-now", destination: "/book" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ ...r, permanent: true }));
  },
};

export default nextConfig;
