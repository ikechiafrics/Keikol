import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { QuoteRequest } from "@/lib/quote-types";

export async function fetchAllQuoteRequests(): Promise<QuoteRequest[]> {
  const q = query(collection(db, "quoteRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuoteRequest);
}

export function useQuoteRequests() {
  return useQuery({ queryKey: ["admin-quotes"], queryFn: fetchAllQuoteRequests });
}
