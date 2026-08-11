"use client";

import Script from "next/script";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * GA4, plus the two conversions that actually matter for this business:
 * tap-to-call and reservation submits.
 *
 * Renders nothing until NEXT_PUBLIC_GA4_ID is set, so the site ships clean
 * until the property exists. Mark `call_click` and `reservation_submit` as key
 * events in GA4 Admin → Events once data starts flowing (that step is manual).
 */
export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;

    // Any tel: link anywhere on the site → call_click
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="tel:"]',
      ) as HTMLAnchorElement | null;
      if (el) {
        window.gtag?.("event", "call_click", {
          phone: el.getAttribute("href")?.replace("tel:", "") ?? "",
          location: window.location.pathname,
        });
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}

/** Fire a conversion from anywhere in the app (no-op without GA4). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined") window.gtag?.("event", name, params ?? {});
}
