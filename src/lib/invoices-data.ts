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

// All of a customer's invoices across every booking, for a dashboard-level
// summary (e.g. total unpaid). A single equality filter with no orderBy, so
// this doesn't need its own composite index.
export async function fetchInvoicesForUser(userId: string): Promise<Invoice[]> {
  const q = query(collection(db, "invoices"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice);
}

export function useInvoicesForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["invoices-for-user", userId],
    queryFn: () => fetchInvoicesForUser(userId!),
    enabled: !!userId,
  });
}

// Every invoice across every booking — admin-only (per firestore.rules),
// used for the "Export Invoices CSV" action rather than any reactive
// display, so a plain fetch is enough without a query hook wrapper.
export async function fetchAllInvoices(): Promise<Invoice[]> {
  const snap = await getDocs(collection(db, "invoices"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Invoice);
}
