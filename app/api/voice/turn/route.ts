import { NextRequest } from "next/server";
import { buildVoicePrompt, FORWARD_NUMBERS } from "@/lib/voice-prompt";
import { getVoiceSession, saveVoiceSession } from "@/lib/voice-store";
import { spaceSummary } from "@/lib/spaces-store";
import { xml, say, gatherTurn, PHRASES, VoiceLang } from "@/lib/voice-twiml";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Ring all owner phones simultaneously; first to answer takes the call. */
function transferTwiml(lang: VoiceLang, line: string): string {
  return (
    say(lang, line) +
    `<Dial timeout="25">` +
    FORWARD_NUMBERS.map((n) => `<Number>${n}</Number>`).join("") +
    `</Dial>` +
    say(lang, PHRASES[lang].noAnswer)
  );
}

export async function POST(req: NextRequest) {
  const lang: VoiceLang =
    req.nextUrl.searchParams.get("lang") === "es" ? "es" : "en";
  const attempt = parseInt(req.nextUrl.searchParams.get("attempt") ?? "0") || 0;
  const p = PHRASES[lang];

  let callSid = "";
  let speech = "";
  try {
    const form = await req.formData();
    callSid = String(form.get("CallSid") ?? "");
    speech = String(form.get("SpeechResult") ?? "").trim();
  } catch {}

  // Silence: reprompt once, then hand off to a human.
  if (!speech) {
    if (attempt >= 2) return xml(transferTwiml(lang, p.trouble));
    return xml(gatherTurn(lang, say(lang, p.reprompt), attempt));
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return xml(transferTwiml(lang, p.connecting));

  // Live availability for the brain
  let availabilityNote = "";
  try {
    const s = await spaceSummary();
    availabilityNote =
      s.truckAvailable > 0
        ? `LIVE AVAILABILITY: ${s.truckAvailable} of ${s.truckTotal} truck spaces open right now. Spaces are picked or auto-assigned when booking on the website.`
        : `LIVE AVAILABILITY: the numbered spaces show full right now — be upfront, and offer to connect them to a person to check for an opening.`;
  } catch {}

  try {
    const history = callSid ? await getVoiceSession(callSid) : [];
    const messages = [...history, { role: "user" as const, content: speech }];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        temperature: 0.3,
        system: buildVoicePrompt(lang, availabilityNote),
        messages: messages.slice(-12),
      }),
    });
    if (!res.ok) {
      console.error("voice: Anthropic error", res.status, await res.text());
      return xml(transferTwiml(lang, p.connecting));
    }
    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    let reply =
      json.content
        ?.filter((b) => b.type === "text" && b.text)
        .map((b) => b.text)
        .join(" ")
        .trim() || "";

    const wantsTransfer = /\[\[transfer\]\]/i.test(reply);
    const wantsBye = /\[\[bye\]\]/i.test(reply);
    reply = reply.replace(/\[\[[^\]]*\]\]/g, "").trim() || p.reprompt;

    if (callSid) {
      await saveVoiceSession(callSid, [
        ...messages,
        { role: "assistant", content: reply },
      ]);
    }

    if (wantsTransfer) return xml(transferTwiml(lang, reply));
    if (wantsBye) return xml(say(lang, reply) + "<Hangup/>");
    return xml(gatherTurn(lang, say(lang, reply)));
  } catch (e) {
    console.error("voice turn error", e);
    return xml(transferTwiml(lang, p.connecting));
  }
}
