import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Billboard } from "@/data/billboards";

export async function fetchAllBillboards(): Promise<Billboard[]> {
  const snap = await getDocs(collection(db, "billboards"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Billboard);
}

export async function fetchBillboardById(id: string): Promise<Billboard | null> {
  const snap = await getDoc(doc(db, "billboards", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Billboard) : null;
}

export function useBillboards() {
  return useQuery({
    queryKey: ["billboards"],
    queryFn: fetchAllBillboards,
  });
}

export function useBillboard(id: string | undefined) {
  return useQuery({
    queryKey: ["billboard", id],
    queryFn: () => fetchBillboardById(id!),
    enabled: !!id,
  });
}
