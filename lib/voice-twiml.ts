import { NextResponse } from "next/server";

/** Shared TwiML helpers for the phone agent. */

export type VoiceLang = "en" | "es";

/** Neural voices + speech-recognition locales per language. */
export const VOICE = {
  en: { tts: "Polly.Matthew-Neural", stt: "en-US" },
  es: { tts: "Polly.Lupe-Neural", stt: "es-MX" },
} as const;

export function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function say(lang: VoiceLang, text: string): string {
  return `<Say voice="${VOICE[lang].tts}">${esc(text)}</Say>`;
}

export function xml(body: string): NextResponse {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`,
    { headers: { "Content-Type": "text/xml" } },
  );
}

/** Wrap spoken content in a speech <Gather> that posts to the turn loop. */
export function gatherTurn(
  lang: VoiceLang,
  inner: string,
  attempt = 0,
): string {
  return (
    `<Gather input="speech" language="${VOICE[lang].stt}" speechTimeout="auto" ` +
    `action="/api/voice/turn?lang=${lang}&amp;attempt=${attempt}" method="POST">${inner}</Gather>` +
    // caller stayed silent → re-enter the turn route to reprompt/escalate
    `<Redirect method="POST">/api/voice/turn?lang=${lang}&amp;attempt=${attempt + 1}</Redirect>`
  );
}

export const PHRASES = {
  en: {
    firstGather:
      "Alright! This is Big D, the virtual facilities officer. Ask me about rates, showers, directions, or booking a space. How can I help?",
    reprompt: "Sorry, I didn't catch that. What can I help you with?",
    connecting: "You got it — connecting you to one of our folks now. Hang tight.",
    noAnswer:
      "Looks like nobody could pick up right now. Please try again in a bit, or book any time at CAD truck parking dot com. Take care!",
    goodbye: "Thanks for calling CAD Truck Parking. Drive safe out there!",
    trouble:
      "I'm having a little trouble hearing you, so let me get you to a person.",
  },
  es: {
    firstGather:
      "¡Perfecto! Habla Big D, el encargado virtual del patio. Pregúntame por tarifas, regaderas, cómo llegar o cómo reservar tu espacio. ¿En qué te ayudo?",
    reprompt: "Perdón, no te escuché bien. ¿En qué te puedo ayudar?",
    connecting: "Claro que sí — te comunico con una persona ahora mismo. No cuelgues.",
    noAnswer:
      "Parece que nadie pudo contestar en este momento. Inténtalo de nuevo en un rato, o reserva a cualquier hora en CAD truck parking punto com. ¡Cuídate!",
    goodbye: "Gracias por llamar a CAD Truck Parking. ¡Buen camino!",
    trouble:
      "Me está costando escucharte, así que mejor te comunico con una persona.",
  },
} as const;
