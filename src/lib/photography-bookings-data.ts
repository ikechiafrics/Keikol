import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { PhotographyBooking } from "@/lib/photography-booking-types";

export async function fetchAllPhotographyBookings(): Promise<PhotographyBooking[]> {
  const q = query(collection(db, "photographyBookings"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PhotographyBooking);
}

export function usePhotographyBookings() {
  return useQuery({ queryKey: ["photography-bookings"], queryFn: fetchAllPhotographyBookings });
}
