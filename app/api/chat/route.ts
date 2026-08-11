import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/chat-prompt";
import { spaceSummary } from "@/lib/spaces-store";

export const runtime = "nodejs";

const MAX_TURNS = 12; // last N messages sent to the model
const MAX_CHARS = 1200; // per message

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMessage[]; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const lang = body.lang === "es" ? "es" : "en";
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages = raw
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "No message" }, { status: 400 });
  }

  const key = process.env.ANTHROPIC_API_KEY;

  // Dev-only mock so the widget can be exercised without an API key.
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        reply:
          lang === "es"
            ? "(modo de prueba) ¡Claro! Trailblazer mensual cuesta $180. ¿Te aparto un espacio?\n[[book:trailblazer:monthly]]"
            : "(mock mode) You bet! Trailblazer monthly runs $180. Want me to get you set up?\n[[book:trailblazer:monthly]]",
      });
    }
    return NextResponse.json(
      { error: "Chat is not configured." },
      { status: 503 },
    );
  }

  let availabilityNote = "";
  try {
    const s = await spaceSummary();
    availabilityNote =
      s.truckAvailable > 0
        ? `LIVE AVAILABILITY RIGHT NOW: ${s.truckAvailable} of ${s.truckTotal} truck spaces open` +
          (s.nextSpace ? ` (next space to be assigned: #${s.nextSpace})` : "") +
          `; ${s.rvAvailable} RV pads open. A specific space number is auto-assigned the moment a reservation is made.`
        : `LIVE AVAILABILITY RIGHT NOW: all numbered truck spaces show taken in the inventory (${s.rvAvailable} RV pads open). Be upfront that the lot is running full; suggest calling ${"1-877-607-CADD (1-877-607-2233)"} to check for an opening — and note they can still submit a reservation and the office will assign a space as soon as one frees up.`;
  } catch (e) {
    console.error("availability lookup failed", e);
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
        max_tokens: 400,
        temperature: 0.3,
        system: buildSystemPrompt(lang, availabilityNote),
        messages,
      }),
    });

    if (!res.ok) {
      console.error("Anthropic error", res.status, await res.text());
      return NextResponse.json(
        { error: "Chat is unavailable right now." },
        { status: 502 },
      );
    }

    const json = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const reply =
      json.content
        ?.filter((b) => b.type === "text" && b.text)
        .map((b) => b.text)
        .join("\n")
        .trim() || "";

    if (!reply) {
      return NextResponse.json(
        { error: "Chat is unavailable right now." },
        { status: 502 },
      );
    }
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("Chat error", e);
    return NextResponse.json(
      { error: "Chat is unavailable right now." },
      { status: 502 },
    );
  }
}
