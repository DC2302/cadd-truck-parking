import { Suspense } from "react";
import type { Metadata } from "next";
import BookingWizard from "@/components/BookingWizard";

export const metadata: Metadata = {
  title: "Reserve a Space — CADD Truck Parking, Midland TX",
  description:
    "Pick your plan, accept the terms, and pay online or on arrival. Trailblazer from $25/day, IronHauler with unlimited showers from $40/day. Reserva tu espacio.",
};

export default function BookPage() {
  return (
    <div className="grain bg-surface0 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <BookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
