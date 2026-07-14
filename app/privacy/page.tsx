import type { Metadata } from "next";
import {
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_VERSION,
  PRIVACY_EFFECTIVE,
} from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy — CADD Truck Parking",
  description:
    "What information CADD Truck Parking collects, why, who we share it with, and the choices you have. Plain language, no legalese.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-panel py-16 text-panelink">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] text-redsolid"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Version {PRIVACY_VERSION} · Effective {PRIVACY_EFFECTIVE}
        </p>
        <h1
          className="mt-2 text-5xl font-black uppercase leading-[0.95] sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Privacy Policy
        </h1>

        <div className="stripe mt-6 h-2 w-32" />

        <p className="mt-6 border-l-4 border-redsolid bg-white/60 p-4 text-sm leading-relaxed text-panelmuted">
          <strong>Aviso:</strong> Esta política está redactada en inglés y la
          versión en inglés es la que rige. Si tienes preguntas sobre cómo
          manejamos tu información, llámanos al 1-877-607-2233 o al (325)
          450-7486 y con gusto te lo explicamos.
        </p>

        <div className="mt-8 space-y-4 text-[15px] leading-relaxed">
          {PRIVACY_INTRO.map((p, i) => (
            <p key={i} className="font-semibold">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          {PRIVACY_SECTIONS.map((s) => (
            <section key={s.id} id={s.id}>
              <h2
                className="text-2xl font-bold uppercase tracking-wide"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-panelink/85">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.items && (
                  <ul className="list-disc space-y-2 pl-6">
                    {s.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                )}
                {s.after?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t-4 border-panelink pt-6">
          <p
            className="text-xs uppercase tracking-widest text-panelmuted"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            CADD Realty, LLC d/b/a CADD Truck Parking · 4500 East County Road
            130, Midland, TX 79706
          </p>
        </div>
      </div>
    </div>
  );
}
