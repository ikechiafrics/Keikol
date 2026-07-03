import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Booking } from "@/lib/booking-types";

export async function fetchAllBookings(): Promise<Booking[]> {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export function useBookings() {
  return useQuery({ queryKey: ["admin-bookings"], queryFn: fetchAllBookings });
}
