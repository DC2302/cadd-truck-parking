import { NextRequest } from "next/server";
import { xml, say, gatherTurn, PHRASES, VoiceLang } from "@/lib/voice-twiml";

export const runtime = "nodejs";

/** Reads the language choice and opens the conversation in that language. */
export async function POST(req: NextRequest) {
  let digits = "";
  let speech = "";
  try {
    const form = await req.formData();
    digits = String(form.get("Digits") ?? "");
    speech = String(form.get("SpeechResult") ?? "").toLowerCase();
  } catch {}

  const lang: VoiceLang =
    digits === "2" || /espa|spanish/.test(speech) ? "es" : "en";

  return xml(gatherTurn(lang, say(lang, PHRASES[lang].firstGather)));
}
