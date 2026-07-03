import { useQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Booking } from "@/lib/booking-types";

export async function fetchAllBookings(): Promise<Booking[]> {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, "bookings", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null;
}

export function useBookings() {
  return useQuery({ queryKey: ["admin-bookings"], queryFn: fetchAllBookings });
}

// Self-service cancellation for a booking that hasn't been confirmed yet
// (nothing invoiced/paid, so the owner can cancel outright).
export async function cancelBooking(bookingId: string) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}

// For an already-confirmed booking, the owner can only flag it for admin
// review rather than cancel it directly, since a confirmed campaign may
// already have invoices/payment attached.
export async function requestBookingCancellation(bookingId: string) {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "cancellation_requested",
    updatedAt: serverTimestamp(),
  });
}
