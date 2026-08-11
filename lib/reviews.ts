/**
 * Real Google reviews for CADD Truck Parking, quoted as written.
 *
 * Kept in ONE place (not in lib/i18n.tsx) on purpose: a customer's words are a
 * factual record, so they are never translated or reworded per language — the
 * Spanish page shows the same original text with Spanish labels around it.
 *
 * Rules for editing this file:
 *  - Quote verbatim. Trim with an ellipsis if a review rambles; never rewrite it.
 *  - Only reviews actually published on the public Google profile.
 *  - Do NOT add aggregateRating structured data from these. Google's guidelines
 *    disallow self-serving review markup for rich results, and inventing a
 *    rating risks a manual penalty. Link to the live profile instead.
 */

export type Review = {
  /** Reviewer name as shown publicly on Google. */
  name: string;
  /** Verbatim text (may be trimmed with … but never reworded). */
  text: string;
  stars: 5;
};

export const REVIEWS: Review[] = [
  {
    name: "AB R.",
    text:
      "Not only is your property SAFE and under surveillance, but the lounge, and extra amenities offered are great!! Definitely recommend!",
    stars: 5,
  },
  {
    name: "Jima K.",
    text:
      "I'm glad I found CADD truck parking, great amenities (shower, lounge, air pumps to fill your tire) and you can even order parts from FleetPride delivered here… not to mention it's 3.5 miles from Flying J. Go check it out you won't be disappointed.",
    stars: 5,
  },
  {
    name: "Tyson Taylor",
    text:
      "Met the owner. He was great to help me out with some short term parking for the night. It looks like they have really cool facilities that look to be well kept and clean. Really appreciate all of their help.",
    stars: 5,
  },
  {
    name: "Jessica Chandler",
    text:
      "This place goes above and beyond to accommodate their customers!! Come see Daniel! Great guy!",
    stars: 5,
  },
  {
    name: "David Ellis",
    text: "Love this place, well priced, pretty easy to find, good peoples.",
    stars: 5,
  },
  {
    name: "Rey N.",
    text: "Awesome establishment! Great place!",
    stars: 5,
  },
];
