import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Invoice } from "@/lib/invoice-types";

export async function fetchInvoicesForBooking(bookingId: string): Promise<Invoice[]> {
  const q = query(
    collection(db, "invoices"),
    where("bookingId", "==", bookingId),
    orderBy("issuedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice);
}

export function useInvoicesForBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: ["invoices", bookingId],
    queryFn: () => fetchInvoicesForBooking(bookingId!),
    enabled: !!bookingId,
  });
}
