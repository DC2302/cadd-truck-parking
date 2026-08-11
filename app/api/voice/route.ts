import { NextRequest } from "next/server";
import { xml, esc } from "@/lib/voice-twiml";

export const runtime = "nodejs";

/**
 * Twilio entry point — point the number's "A call comes in" webhook here.
 * Greets in both languages and gathers the caller's choice.
 */
export async function POST(req: NextRequest) {
  const repeat = req.nextUrl.searchParams.get("repeat") === "1";

  const greeting = repeat
    ? ""
    : `<Say voice="Polly.Matthew-Neural">${esc(
        "Hi, and thank you for calling CAD Truck Parking!",
      )}</Say>`;

  return xml(
    greeting +
      `<Gather input="dtmf speech" numDigits="1" timeout="6" speechTimeout="auto" ` +
      `hints="english, spanish, español" action="/api/voice/lang" method="POST">` +
      `<Say voice="Polly.Matthew-Neural">${esc("For English, say English, or press 1.")}</Say>` +
      `<Say voice="Polly.Lupe-Neural">${esc("Para español, diga español, o marque dos.")}</Say>` +
      `</Gather>` +
      // no input: offer the menu once more, then default to English
      (repeat
        ? `<Redirect method="POST">/api/voice/lang</Redirect>`
        : `<Redirect method="POST">/api/voice?repeat=1</Redirect>`),
  );
}
