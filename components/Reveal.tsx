"use client";

import { useEffect, useRef } from "react";

/** Adds .is-visible when scrolled into view (pairs with .reveal in CSS). */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  blur = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Use the blur-drop effect instead of the slide-up effect. */
  blur?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${blur ? "reveal-blur" : "reveal"} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
