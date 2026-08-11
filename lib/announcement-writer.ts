import { BUSINESS } from "@/lib/pricing";
import { cleanAnnouncement } from "@/lib/announcements";
import { LIMITS, THEMES, ThemeId } from "@/lib/announcements-types";

/**
 * Turns a plain request into a finished, bilingual announcement.
 *
 * The owner types it the way he'd say it out loud ("dust storm coming
 * Thursday, tell drivers to strap down"). This writes the headline, body and
 * up to three callouts in BOTH English and Mexican Spanish, and picks the
 * theme. Spanish is written natively for drivers, not translated word for
 * word from the English.
 *
 * With no key or a failed call it falls back to the owner's own text laid out
 * cleanly — every field stays editable, so the composer is never a dead end.
 */

type Drafted = ReturnType<typeof cleanAnnouncement>;

const SYSTEM = `You write the weekly announcement banner for CADD Truck Parking, a family-owned secure truck parking lot at ${BUSINESS.addressShort}, in the Permian Basin. Established ${BUSINESS.established}. The audience is working truck drivers — owner-operators and fleet drivers running the Permian oilfield and I-20.

Voice: direct, practical, respectful of drivers' time. Plainspoken West Texas, never corporate, never cutesy. Drivers want to know what changed and what to do about it. Never use more than one exclamation point in the whole message.

NEVER invent facts. No prices, dates, road closures, weather forecasts, hours, or phone numbers that were not in the request. If the owner didn't say it, it does not go on the banner. A wrong road or weather claim on a truck-parking site is worse than no banner at all.

Write BOTH languages. Spanish is Mexican Spanish as a driver would actually say it — natural, not a literal translation. Keep both versions the same length and meaning.

Pick the theme that best fits:
${THEMES.map((t) => `- ${t.id}: ${t.use}`).join("\n")}

Return ONLY a JSON object, no prose:
{
  "theme": one of ${THEMES.map((t) => `"${t.id}"`).join(" | ")},
  "kicker":   {"en": "SHORT ALL-CAPS LINE", "es": "..."},          max ${LIMITS.kicker} chars each
  "headline": {"en": "the message itself", "es": "..."},           max ${LIMITS.headline} chars each
  "body":     {"en": "1-2 sentences", "es": "..."},                max ${LIMITS.body} chars each
  "facts": [ {"en": "short chip", "es": "..."} ],                  up to ${LIMITS.facts}, max ${LIMITS.fact} chars each — concrete and useful, omit rather than pad
  "cta": {"label": {"en": "...", "es": "..."}, "href": "/book"} or null — only when there is a genuine next step
}

Valid href values: "/book", "/#rates", "/#amenities", "/#location", "/#faq", "/blog", "tel:${BUSINESS.phoneTollFreeDial}". Use null if none truly fits.`;

function mechanicalDraft(request: string, theme?: ThemeId): Drafted {
  const text = request.replace(/\s+/g, " ").trim();
  const first = text.split(/(?<=[.!?])\s/)[0] ?? text;
  const rest = text.length > first.length ? text.slice(first.length).trim() : "";
  return cleanAnnouncement({
    theme: theme ?? "driver",
    kicker: { en: "THIS WEEK AT CADD", es: "ESTA SEMANA EN CADD" },
    headline: { en: first, es: first },
    body: { en: rest, es: rest },
    facts: [],
    cta: null,
  });
}

export async function draftAnnouncement(
  request: string,
  hintTheme?: ThemeId,
): Promise<{ draft: Drafted; ai: boolean; note?: string }> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) {
    return {
      draft: mechanicalDraft(request, hintTheme),
      ai: false,
      note: "Written out as-is — set ANTHROPIC_API_KEY to have it drafted and translated for you.",
    };
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: hintTheme
              ? `Use the "${hintTheme}" theme.\n\nWhat the owner asked for:\n${request}`
              : `What the owner asked for:\n${request}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Claude ${res.status}`);
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .trim();
    // Models sometimes fence the JSON; take the outermost object.
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(json);
    const draft = cleanAnnouncement({
      ...parsed,
      theme: hintTheme || parsed.theme,
    });
    if (!draft.headline.en) throw new Error("no headline");
    return { draft, ai: true };
  } catch {
    return {
      draft: mechanicalDraft(request, hintTheme),
      ai: false,
      note: "The writer was unavailable, so this is your text laid out as-is — edit anything before publishing.",
    };
  }
}
