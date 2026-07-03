import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Billboard, Availability } from "@/data/billboards";

// Redacted public view of a confirmed booking — only what's needed to
// compute billboard availability for anonymous visitors. Deliberately kept
// separate from the full `Booking` type in booking-types.ts.
export interface ConfirmedWindow {
  billboardId: string;
  startDate: string;
  endDate: string;
}

export async function fetchConfirmedWindows(): Promise<ConfirmedWindow[]> {
  if (typeof window === "undefined") return [];
  const snap = await getDocs(collection(db, "publicBookingWindows"));
  return snap.docs.map((d) => d.data() as ConfirmedWindow);
}

export function useConfirmedWindows() {
  return useQuery({
    queryKey: ["public-booking-windows"],
    queryFn: fetchConfirmedWindows,
  });
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getConfirmedRangesForBillboard(
  billboardId: string,
  windows: ConfirmedWindow[],
): ConfirmedWindow[] {
  return windows.filter((w) => w.billboardId === billboardId);
}

export function isDateInAnyConfirmedRange(date: Date, ranges: ConfirmedWindow[]): boolean {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return ranges.some((r) => r.startDate <= iso && iso <= r.endDate);
}

export function getEffectiveAvailability(
  billboard: Billboard,
  windows: ConfirmedWindow[],
): Availability {
  if (billboard.availability === "Coming Soon" || billboard.availability === "Not Available") {
    return billboard.availability;
  }
  const today = todayISO();
  const isOccupiedNow = getConfirmedRangesForBillboard(billboard.id, windows).some(
    (r) => r.startDate <= today && today <= r.endDate,
  );
  return isOccupiedNow ? "Available Soon" : "Available";
}
