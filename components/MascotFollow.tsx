"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Big D follows the mouse — 2D take on the Spline "look at cursor" robot.
 *
 * mode "lean":   keeps one pose, tilts/leans toward the cursor from his boots.
 * mode "follow": also swaps poses — presents left / points right / thumbs-up
 *                depending on where the cursor is relative to him.
 *
 * Desktop pointers only; disabled for touch and reduced-motion users.
 */
export default function MascotFollow({
  mode = "lean",
  src = "",
  poses,
  className = "",
  imgClass = "",
  maxTilt = 9,
}: {
  mode?: "lean" | "follow";
  src?: string;
  poses?: { left: string; right: string; idle: string };
  className?: string;
  imgClass?: string;
  maxTilt?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const [pose, setPose] = useState<"left" | "right" | "idle">("idle");

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    // preload poses so swaps never flicker
    if (poses) {
      for (const p of Object.values(poses)) {
        const im = new Image();
        im.src = p;
      }
    }

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const wrap = wrapRef.current;
        const inner = innerRef.current;
        if (!wrap || !inner) return;
        const r = wrap.getBoundingClientRect();
        if (r.width === 0) return; // hidden at this breakpoint
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);

        const tilt = Math.max(-maxTilt, Math.min(maxTilt, dx / 45));
        const shift = Math.max(-10, Math.min(10, dx / 60));
        const bow = Math.max(-4, Math.min(4, dy / 120)); // slight nod
        inner.style.transform = `rotate(${tilt}deg) translateX(${shift}px) translateY(${bow}px)`;

        if (mode === "follow") {
          // hysteresis so he doesn't twitch at the boundaries
          setPose((prev) => {
            if (dx < -90) return "left";
            if (dx > 90) return "right";
            if (Math.abs(dx) < 45) return "idle";
            return prev;
          });
        }
      });
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [mode, maxTilt, poses]);

  const current =
    mode === "follow" && poses
      ? pose === "left"
        ? poses.left
        : pose === "right"
          ? poses.right
          : poses.idle
      : src;

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <div
        ref={innerRef}
        style={{
          transformOrigin: "50% 100%",
          transition: "transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="" loading="lazy" className={imgClass} />
      </div>
    </div>
  );
}
