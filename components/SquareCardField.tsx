"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Square?: any;
  }
}

const SDK_URL =
  process.env.NEXT_PUBLIC_SQUARE_ENV === "production"
    ? "https://web.squarecdn.com/v1/square.js"
    : "https://sandbox.web.squarecdn.com/v1/square.js";

let sdkPromise: Promise<void> | null = null;
function loadSdk(): Promise<void> {
  if (typeof window === "undefined")
    return Promise.reject(new Error("no window"));
  if (window.Square) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load the secure card form."));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

export interface SquareCardHandle {
  /** Tokenize the entered card; resolves to a single-use payment token. */
  tokenize: () => Promise<string>;
  ready: boolean;
}

/**
 * Square Web Payments SDK card input. Renders Square's PCI-compliant card
 * iframe; the parent calls tokenize() on submit to get a one-time token that
 * the server turns into a card on file.
 */
export const SquareCardField = forwardRef<
  SquareCardHandle,
  { onError?: (msg: string) => void }
>(function SquareCardField({ onError }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let canceled = false;
    let card: any;
    (async () => {
      try {
        await loadSdk();
        if (canceled) return;
        const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
        if (!appId || !locationId)
          throw new Error("Card payments aren't configured.");
        const payments = window.Square.payments(appId, locationId);
        card = await payments.card();
        if (canceled) {
          try {
            await card.destroy();
          } catch {}
          return;
        }
        await card.attach(containerRef.current);
        cardRef.current = card;
        setReady(true);
      } catch (e) {
        onError?.(
          e instanceof Error ? e.message : "The card form failed to load.",
        );
      }
    })();
    return () => {
      canceled = true;
      if (card) {
        try {
          card.destroy();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      ready,
      async tokenize() {
        if (!cardRef.current) throw new Error("The card form isn't ready yet.");
        const result = await cardRef.current.tokenize();
        if (result.status === "OK") return result.token as string;
        const msg =
          result.errors?.map((e: any) => e.message).join(" ") ||
          "Please check the card details and try again.";
        throw new Error(msg);
      },
    }),
    [ready],
  );

  return (
    <div>
      <div
        ref={containerRef}
        className="min-h-[52px] rounded-lg border border-line bg-white p-3"
      />
      {!ready && (
        <p className="mt-2 text-xs text-muted">Loading secure card field…</p>
      )}
    </div>
  );
});
