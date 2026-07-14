/**
 * CADD Truck Parking — Privacy Policy.
 *
 * Single source of truth, rendered on /privacy. Follows the same structure
 * as lib/terms.ts. When you materially change data practices, bump
 * PRIVACY_VERSION and PRIVACY_EFFECTIVE.
 */

export const PRIVACY_VERSION = "2026-07-13.v1";
export const PRIVACY_EFFECTIVE = "July 13, 2026";

export interface PrivacySection {
  id: string;
  title: string;
  body: string[];
  items?: string[];
  after?: string[];
}

export const PRIVACY_INTRO = [
  `This Privacy Policy explains what information CADD Realty, LLC ("CADD," "we," "us," or "our") collects through caddtruckparking.com and at the CADD Truck Parking facility at 4500 East County Road 130, Midland, Texas 79706 — why we collect it, who we share it with, and the choices you have. We run a truck yard, not a data business: we collect what we need to rent you a space, document our agreement, and get paid. Nothing more.`,
];

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: "you-give-us",
    title: "1. Information You Give Us",
    body: [
      `When you reserve a space, you provide your name, company, email, phone number, vehicle information (unit number, plate, length), your plan and rate selections, your chosen payment method, and your typed signature accepting the Terms & Conditions. When you call, email, or message us, we receive whatever you share.`,
    ],
  },
  {
    id: "collected-automatically",
    title: "2. Information Recorded Automatically",
    body: [
      `When you submit a reservation, we record the date and time, your IP address, your browser information, and the version of the Terms & Conditions you accepted. We keep this as evidence of your electronic signature — the same way a paper contract file keeps the signed page. Our web host also keeps routine server logs. We do not currently run advertising trackers or third-party analytics on this site.`,
    ],
  },
  {
    id: "payments",
    title: "3. Payments",
    body: [
      `Card payments are processed by Square on Square's own systems under Square's privacy policy. Your card number never touches our website or our records — we see only whether the payment went through. If you pay by Zelle, Cash App, cash, or check, we record the method you chose and whether payment was received.`,
    ],
  },
  {
    id: "chat",
    title: "4. The Chat Assistant",
    body: [
      `The chat widget on this site is powered by Anthropic's Claude AI. Messages you type are sent to Anthropic to generate a reply. Please don't put sensitive personal information into the chat — use it for questions about parking, rates, and availability. We do not use chat conversations to build profiles of you.`,
    ],
  },
  {
    id: "use",
    title: "5. How We Use Information",
    body: [
      `To manage your reservation and space assignment, contact you about your parking, collect payment, maintain legal records of executed agreements, and operate and improve the facility and website. That's the whole list.`,
    ],
  },
  {
    id: "sharing",
    title: "6. What We Share — and What We Don't",
    body: [
      `We do not sell your personal information. We share information only with the service providers that keep this operation running — payment processing (Square), website hosting (Vercel), and the chat assistant (Anthropic) — each under its own privacy terms, and with authorities if the law requires it (for example, a lawful request regarding a vehicle stored at the Facility).`,
    ],
  },
  {
    id: "retention",
    title: "7. How Long We Keep It",
    body: [
      `Reservation and acceptance records are legal records of our agreement, so we keep them for as long as the law and good business practice require — including after your parking ends. Routine correspondence is kept only as long as it's useful.`,
    ],
  },
  {
    id: "choices",
    title: "8. Your Choices and Rights",
    body: [
      `You can ask us what information we have about you, ask us to correct it, or ask us to delete it — call or email us using the contact information below. Note that we may need to keep records of executed agreements and payments even after a deletion request, as the law allows.`,
    ],
  },
  {
    id: "children",
    title: "9. Children",
    body: [
      `This site and the Facility serve businesses and working drivers. The site is not directed at children under 13, and we do not knowingly collect their information.`,
    ],
  },
  {
    id: "changes",
    title: "10. Changes to This Policy",
    body: [
      `If our data practices change, we'll update this page, the version number, and the effective date at the top. Significant changes get plain-language notice, not buried fine print.`,
    ],
  },
  {
    id: "contact",
    title: "11. Contact",
    body: [
      `CADD Realty, LLC — 4500 East County Road 130, Midland, Texas 79706. Phone: 1-877-607-2233 or (325) 450-7486. Email: caddrealty@gmail.com.`,
    ],
  },
];
