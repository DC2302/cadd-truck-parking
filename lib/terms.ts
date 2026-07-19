/**
 * CADD Truck Parking — Terms & Conditions of Parking & Facility Use.
 *
 * Single source of truth: rendered on /terms, inside the booking wizard's
 * acceptance step, and stamped (by version) onto every acceptance record.
 *
 * When you edit this document, bump TERMS_VERSION so records show exactly
 * which revision each customer agreed to.
 */

export const TERMS_VERSION = "2026-07-05.v1";
export const TERMS_EFFECTIVE = "July 5, 2026";

export interface TermsSection {
  id: string;
  title: string;
  body: string[];
  items?: string[];
  after?: string[];
}

export const TERMS_INTRO = [
  `These Terms & Conditions of Parking & Facility Use (these "Terms") govern your use of the CADD Truck Parking facility located at 4500 East County Road 130, Midland, Texas 79706 (the "Facility"), operated by CADD Realty, LLC ("CADD," "we," "us," or "our"). "You" and "Customer" mean the person or company purchasing parking, and any driver, employee, agent, or guest using the Facility under that purchase.`,
  `PLEASE READ THESE TERMS CAREFULLY. THEY INCLUDE AN ASSUMPTION OF RISK, A LIMITATION OF OUR LIABILITY, AND AN INDEMNIFICATION OBLIGATION.`,
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "acceptance",
    title: "1. Agreement to These Terms; Electronic Acceptance",
    body: [
      `By doing any of the following, you accept and agree to be bound by these Terms: (a) checking the acceptance box and submitting a reservation on our website; (b) signing these Terms electronically or on paper; (c) paying for parking by any method, including card, Zelle, Cash App, cash, check, or money order; or (d) entering, parking at, or otherwise using the Facility. Acceptance by any one of these methods is sufficient — you do not need to pay through our website for these Terms to apply.`,
      `You agree that your electronic acceptance (including a checked box and typed name submitted through our website) constitutes your valid, binding signature under the federal Electronic Signatures in Global and National Commerce Act (E-SIGN) and the Texas Uniform Electronic Transactions Act (Tex. Bus. & Com. Code Ch. 322), and that we may keep an electronic record of your acceptance — including the date, time, name, and network information submitted — as evidence of this agreement. You may request a paper copy of these Terms at any time.`,
      `If you are accepting on behalf of a company, you represent that you have authority to bind that company, and "you" includes the company. If more than one person or company is on an account, each is jointly and severally responsible under these Terms.`,
    ],
  },
  {
    id: "license",
    title: "2. What You Are Buying: A Parking License, Not a Lease",
    body: [
      `Your purchase gives you a limited, revocable, non-transferable license to park one commercial vehicle, tractor, trailer, or similar vehicle (a "Vehicle") in the space we assign to you, and to use the shared driver facilities (restrooms, showers, lounge, laundry) during your paid period, subject to these Terms and your selected plan.`,
      `This is a license to park — not a lease, tenancy, storage agreement, or bailment. You do not acquire any possessory or property interest in the Facility or any space. We do not take custody, control, or possession of your Vehicle or its contents at any time. We may reassign your space to a comparable space for operational reasons.`,
    ],
  },
  {
    id: "plans",
    title: "3. Plans, Rates & Showers",
    body: [
      `We offer two plans, each available on daily, weekly, monthly, or annual terms at the rates posted on our website or at the Facility at the time of purchase:`,
    ],
    items: [
      `Trailblazer — assigned space and full shared-facility access; hot showers billed at $1.00 per minute.`,
      `IronHauler — everything in Trailblazer, plus unlimited hot showers and priority space assignment and support.`,
    ],
    after: [
      `Unlimited showers under the IronHauler plan are for the registered driver(s) on the account only, are subject to reasonable fair use, and may not be shared, resold, or transferred. Annual plans are priced at ten months (two months free) and are paid in full up front.`,
      `We may change posted rates at any time. A rate change never affects a period you have already paid for; it applies from your next renewal or purchase.`,
    ],
  },
  {
    id: "term",
    title: "4. Duration, Renewal & Cancellation",
    body: [
      `Daily and weekly purchases expire automatically at the end of the paid period unless renewed.`,
      `Monthly plans renew automatically on the 1st of each month until cancelled. If you start mid-month, your first payment may be prorated at 1/30th of the monthly rate per remaining day. To cancel a monthly plan, give us written notice (email, text, or letter) at least thirty (30) days before your intended end date; cancellation takes effect at the end of the monthly period following the notice period.`,
      `Annual plans run for twelve (12) months from the start date and renew for successive annual periods unless either party gives written notice of non-renewal at least thirty (30) days before the renewal date.`,
      `Refunds. Refund requests must be made within seven (7) days of the purchase date by emailing ${"caddrealty@gmail.com"}. (a) Future reservations: cancel at least forty-two (42) hours before your reservation starts for a full refund. (b) Same-day service: request the refund by email; any use of the service before cancellation may be deducted from the refund. (c) Monthly and annual plans: if you cancel before your paid period ends, we will refund the prorated unused amount less a $25.00 cancellation fee, processed the next business day. Refunds may take 1–2 billing cycles to appear on your statement. Except as stated in this section, amounts paid are non-refundable.`,
    ],
  },
  {
    id: "payment",
    title: "5. Payment, Late Fees & Returned Payments",
    body: [
      `Payment is due in advance of the period purchased. Monthly payments are due on or before the 1st of each month. We accept payment by credit or debit card through our online checkout (processed by Square), and — at our discretion — Zelle, Cash App, cash paid in person at the Facility, cashier's check, or money order. Personal checks may be accepted at our sole discretion. Whatever the method, payment is not made until we actually receive it; putting a payment in the mail is not receipt.`,
      `If a monthly payment is not received in full by the 1st, a late charge of $5.00 per day applies, up to a maximum of $150.00 per month. A $25.00 fee applies to any declined or rejected payment, and a $50.00 fee to any payment returned for insufficient funds.`,
      `If you keep a card on file with us, you authorize us to charge that card for amounts due under these Terms — including renewals, late fees, damage charges, and other amounts you owe — and you agree to keep a valid payment method on file and tell us promptly if it changes.`,
    ],
  },
  {
    id: "deposit",
    title: "6. Security Deposit (When Required)",
    body: [
      `For monthly and annual plans we may require a security deposit of up to one month's rate. Any deposit secures cleaning, damage repair, unpaid amounts, removal of abandoned vehicles, environmental cleanup, and other amounts you owe. Deposits do not earn interest and may not be applied by you toward payments due. Within thirty (30) days after your plan ends and your Vehicle and property are removed, we will send an itemized statement of any deductions and return the balance to the address or account you provide. If the Facility is sold, we may transfer your deposit to the new owner and are then released from responsibility for it.`,
    ],
  },
  {
    id: "vehicle",
    title: "7. Vehicle Requirements: Size, Registration & Insurance",
    body: [
      `Unless we approve otherwise in writing, Vehicles may not exceed 75 feet in length, 8.5 feet in width, or 80,000 pounds gross vehicle weight.`,
      `Every Vehicle at the Facility must carry current registration and liability insurance meeting at least the Texas statutory minimums (currently $30,000 per person / $60,000 per accident bodily injury and $25,000 property damage). You must show proof of insurance before first access and on request, and tell us immediately if your coverage lapses. If your Vehicle is used commercially with cargo valued over $50,000, you must name CADD Realty, LLC as an additional insured on your liability policy and provide a certificate of insurance on request.`,
      `A lapse in registration or insurance is a material violation of these Terms and grounds for suspension or termination of access.`,
    ],
  },
  {
    id: "rules",
    title: "8. Facility Rules",
    body: [`While at the Facility, you and your drivers and guests must:`],
    items: [
      `Park only in your assigned space and keep it clean and safe;`,
      `Obey posted signs and the posted speed limit (10 MPH unless otherwise posted);`,
      `Limit engine idling to 15 minutes and avoid excessive noise or disruptive behavior;`,
      `Dispose of trash, fluids, and waste properly — no chemical dumping of any kind;`,
      `Immediately report and clean up any fuel, oil, or fluid leak from your Vehicle (cleanup costs we incur are charged to you);`,
      `Not pressure wash vehicles, or perform major mechanical repairs, welding, or painting, without our prior written approval (light maintenance is permitted);`,
      `Not smoke, vape, or use tobacco or cannabis products inside any enclosed facility — restrooms, showers, lounge, or covered areas; smoking only in designated outdoor areas;`,
      `Not use, possess, distribute, or be under the influence of illegal drugs or marijuana at the Facility, regardless of whether such substances are legal elsewhere or prescribed;`,
      `Not store or bring hazardous materials, flammable liquids, explosives, toxic substances, or illegal materials onto the Facility without our prior written consent and proper documentation and insurance;`,
      `Limit guests to vehicle delivery, pickup, or brief inspection — no more than 30 minutes without our approval — and take full responsibility for their conduct;`,
      `Report immediately any accident, injury, property damage, security concern, or condition that could damage the Facility;`,
      `Return all gate keys, access cards, and remotes when your plan ends ($250.00 replacement fee per unreturned device);`,
      `Use utilities, plumbing, and shared facilities reasonably and not damage, deface, or remove any part of the Facility;`,
      `Comply with all applicable federal, state, and local laws, including DOT and environmental regulations, and engage in no illegal activity at the Facility.`,
    ],
    after: [
      `Violation of any Facility Rule is a violation of these Terms. We may post additional or updated rules at the Facility or on our website with reasonable notice, and they become part of these Terms.`,
    ],
  },
  {
    id: "access",
    title: "9. Access, Availability & Our Responsibilities",
    body: [
      `We will provide access to the Facility 24 hours a day, 7 days a week, subject to temporary closures for maintenance, repairs, emergencies, or causes beyond our reasonable control, and we will maintain the shared facilities in substantially their current condition, ordinary wear and tear excepted.`,
      `We do not warrant continuous availability of utilities, WiFi, showers, laundry, surveillance, or any amenity. Temporary interruptions are not a breach of these Terms and do not entitle you to a refund or credit, except that if the entire Facility is completely inaccessible for more than seven (7) consecutive days, your rate will be prorated for the period of complete inaccessibility.`,
    ],
  },
  {
    id: "no-transfer",
    title: "10. No Transfer or Subletting",
    body: [
      `Your plan, space, and access credentials are personal to you and may not be assigned, sublet, shared, or resold without our prior written consent, which we may withhold in our sole discretion. Any attempted transfer without consent is void and is a material violation of these Terms.`,
    ],
  },
  {
    id: "violations",
    title: "11. Violations, Suspension & Termination by CADD",
    body: [
      `If you violate these Terms, we may give you written notice describing the violation and a deadline to fix it; if it is not fixed by the deadline, your plan and access terminate on the date stated in the notice. If substantially the same violation recurs within three (3) days of a prior notice, we may terminate without a further cure period.`,
      `If the violation is nonpayment, we may give you written notice requiring payment in full or removal of your Vehicle within three (3) days. If the violation materially affects health or safety, or involves illegal activity, drugs, or a serious breach of the Facility Rules, we may terminate your access immediately, without refund.`,
      `Vehicle immobilization: if any amount you owe is more than five (5) days past due, we may immobilize your Vehicle with a wheel lock or boot until your balance is paid in full. A $100.00 immobilization fee and a $100.00 removal fee apply in addition to the past-due balance and late charges.`,
      `If we terminate for your violation, you remain responsible for the unpaid balance of your current paid period; we will make reasonable efforts to re-license the space, and your responsibility for that balance ends if and when it is re-licensed.`,
      `We reserve the right to refuse service and access to anyone at any time to protect the safety, security, and proper operation of the Facility.`,
    ],
  },
  {
    id: "abandonment",
    title: "12. Abandoned Vehicles",
    body: [
      `A Vehicle is considered abandoned if (a) it remains at the Facility for three (3) or more consecutive days while any amount is unpaid, or (b) you and the Vehicle are absent and out of contact for thirty (30) or more consecutive days regardless of payment status.`,
      `We may remove, tow, impound, or dispose of an abandoned Vehicle in accordance with applicable Texas law, and you are responsible for all resulting costs — towing, storage, administrative costs, and reasonable attorney's fees. We may deduct these from any deposit, charge your payment method on file, and assert any lien available under Texas law to secure amounts you owe.`,
      `If you will be away from the Facility for seven (7) or more consecutive days, tell us in advance in writing. Absence — with or without notice — never suspends your obligation to pay.`,
    ],
  },
  {
    id: "risk",
    title: "13. Assumption of Risk; No Bailment; No Security Guarantee",
    body: [
      `YOU PARK AT YOUR OWN RISK. The Facility is fenced, gated, and equipped with cameras, but we do not guarantee security, continuous monitoring, or protection against theft, vandalism, collision, weather, fire, or the acts of other customers or third parties, and we are not an insurer of your Vehicle or its contents. No bailment is created; we never take custody of your Vehicle or anything in it.`,
      `You are responsible for insuring your own Vehicle, cargo, and property. We strongly recommend you carry physical damage and cargo coverage.`,
    ],
  },
  {
    id: "liability",
    title: "14. Limitation of Liability",
    body: [
      `TO THE MAXIMUM EXTENT PERMITTED BY LAW: (a) we are not liable to you or your drivers, guests, or invitees for any damage, loss, injury, or claim except to the extent proximately caused by our gross negligence or willful misconduct; (b) we are not liable for theft, vandalism, fire, weather events, acts of God, or the criminal or negligent acts of other customers or third parties; (c) we are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, lost cargo value, downtime, or loss of use; and (d) our total aggregate liability for all claims arising out of or relating to these Terms or the Facility will not exceed the amounts you paid us in the twelve (12) months before the event giving rise to the claim.`,
      `Nothing in this section limits liability that cannot be limited under applicable law.`,
    ],
  },
  {
    id: "indemnity",
    title: "15. Indemnification",
    body: [
      `You will indemnify, defend, and hold harmless CADD Realty, LLC and its owners, officers, agents, employees, and representatives from and against all claims, actions, damages, liabilities, costs, and expenses (including reasonable attorney's fees) arising from or related to: (a) your use of the Facility; (b) any act or omission of you or your drivers, employees, contractors, guests, or invitees; (c) your violation of these Terms or of any law; (d) any accident, injury, or property damage arising from your use of the Facility; or (e) any environmental contamination caused by you or your Vehicle. This obligation survives termination of these Terms.`,
    ],
  },
  {
    id: "asis",
    title: "16. Condition of the Facility; Inspection",
    body: [
      `You accept your assigned space and the shared facilities AS-IS, WHERE-IS, with no warranties or representations beyond those expressly stated in these Terms or required by Texas law. You confirm you have had the opportunity to inspect the Facility.`,
      `We and our agents may enter and inspect any space at any time without notice for safety, security, maintenance, or enforcement of these Terms; we will try to give 24 hours' notice for non-emergency inspections when practical.`,
      `You are responsible for damage to the Facility caused by you or your drivers, guests, or invitees, beyond ordinary wear and tear. Repair charges are due within ten (10) days of invoice; unpaid damage charges are treated the same as unpaid rent.`,
    ],
  },
  {
    id: "environment",
    title: "17. Environmental Responsibility",
    body: [
      `You must comply with all federal, state, and local environmental laws and must not cause or permit any spill, release, discharge, or disposal of hazardous materials, petroleum products, or other regulated substances at the Facility. If contamination results from your use of the Facility, you are solely responsible for all cleanup and remediation costs, you must notify us immediately, and you will indemnify us for any related claims.`,
    ],
  },
  {
    id: "surveillance",
    title: "18. Cameras, Surveillance & Your Information",
    body: [
      `The Facility may be monitored by video surveillance, and you consent to recording in outdoor and common areas for security, incident investigation, and enforcement of these Terms. We make no promise that surveillance systems operate continuously.`,
      `We collect the information you submit when reserving (name, company, contact details, vehicle information, and your acceptance record) and use it to run your account, process payments, and meet legal obligations. Card payments are processed by Square; we do not store full card numbers on our servers.`,
    ],
  },
  {
    id: "force-majeure",
    title: "19. Events Beyond Our Control; Damage to the Facility",
    body: [
      `Neither party is liable for failure to perform (other than your payment obligations) caused by fire, flood, severe weather, acts of God, war, civil unrest, labor disputes, government action, utility failure, or other causes beyond its reasonable control.`,
      `If the Facility is destroyed or made totally unusable by a cause beyond our control, these Terms end as of that date and prepaid amounts are prorated to that date. If it is partially unusable but repairable within a reasonable time, we may either restore it (with a proportional rate reduction for the affected portion) or terminate. If the Facility is taken by eminent domain, prepaid amounts are prorated to the date of taking and any condemnation award belongs to us.`,
    ],
  },
  {
    id: "changes",
    title: "20. Changes to These Terms",
    body: [
      `We may update these Terms from time to time. We will post the updated version (with a new version date) on our website and at the Facility, and give reasonable notice of material changes. Updates apply from your next renewal or purchase after the effective date — continued use or renewal after that date is acceptance of the updated Terms. No oral statement modifies these Terms; any individual modification must be in writing signed by CADD.`,
    ],
  },
  {
    id: "notices",
    title: "21. Notices",
    body: [
      `Notices to us must be in writing and delivered personally, by email with confirmation of receipt, by certified mail (return receipt requested), or by recognized overnight courier to: CADD Realty, LLC, 100 Ranger Point, Adkins, TX 78101. Notices to you will be sent to the mailing address, email address, or phone number you provided, and you are responsible for keeping that information current.`,
    ],
  },
  {
    id: "law",
    title: "22. Governing Law, Venue & Attorney's Fees",
    body: [
      `These Terms are governed by Texas law. Any legal action arising from these Terms or your use of the Facility must be brought in the state courts of Midland County, Texas, or the federal district court with jurisdiction over Midland County, and both parties consent to exclusive jurisdiction and venue there.`,
      `If we engage an attorney to collect amounts you owe or to enforce these Terms, you will pay our reasonable attorney's fees, costs, and expenses to the greatest extent allowed by law. In any litigation between the parties, the prevailing party is entitled to recover reasonable attorney's fees and court costs.`,
      `TO THE EXTENT PERMITTED BY LAW, EACH PARTY KNOWINGLY AND VOLUNTARILY WAIVES ANY RIGHT TO A TRIAL BY JURY IN ANY DISPUTE ARISING OUT OF OR RELATING TO THESE TERMS OR THE FACILITY.`,
    ],
  },
  {
    id: "misc",
    title: "23. General",
    body: [
      `Severability: if any provision of these Terms is held invalid, the remainder stays in full force. No waiver: our failure to enforce any provision is not a waiver of it or of our right to enforce it later. Cumulative remedies: our rights and remedies under these Terms are in addition to those available under Texas law. Survival: sections that by their nature should survive (including payment obligations, assumption of risk, limitation of liability, indemnification, and governing law) survive termination. Entire agreement: these Terms, together with your reservation details and any posted rules or written addenda, are the entire agreement between you and CADD and supersede all prior negotiations and representations. Binding effect: these Terms bind and benefit the parties and their heirs, successors, and permitted assigns.`,
    ],
  },
  {
    id: "representations",
    title: "24. Your Representations",
    body: [
      `By accepting these Terms you represent that: (a) you are at least 18 years old and have authority to enter this agreement; (b) all information you provide is true, accurate, and complete; (c) your Vehicle is properly registered and insured; (d) you are not aware of any mechanical defect or fluid leak that could damage the Facility; and (e) you will use the Facility only for lawful purposes.`,
    ],
  },
];

export const TERMS_CONTACT = `Questions about these Terms? Call us at 1-877-607-CADD (1-877-607-2233) or (325) 450-7486, email caddrealty@gmail.com, or write to CADD Realty, LLC, 100 Ranger Point, Adkins, TX 78101.`;

/** Plain-text render of the full Terms (for email copies / records). */
export function termsAsText(): string {
  const parts: string[] = [
    `CADD TRUCK PARKING — TERMS & CONDITIONS OF PARKING & FACILITY USE`,
    `Version ${TERMS_VERSION} — Effective ${TERMS_EFFECTIVE}`,
    ``,
    ...TERMS_INTRO,
    ``,
  ];
  for (const s of TERMS_SECTIONS) {
    parts.push(s.title, ...s.body);
    if (s.items) parts.push(...s.items.map((i) => `  • ${i}`));
    if (s.after) parts.push(...s.after);
    parts.push(``);
  }
  parts.push(TERMS_CONTACT);
  return parts.join("\n");
}
