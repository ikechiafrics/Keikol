import { useQuery } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Photographer } from "@/lib/photographer-types";

export async function fetchAllPhotographers(): Promise<Photographer[]> {
  const snap = await getDocs(collection(db, "photographers"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Photographer);
}

export async function fetchPhotographerById(id: string): Promise<Photographer | null> {
  const snap = await getDoc(doc(db, "photographers", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Photographer) : null;
}

export function usePhotographers() {
  return useQuery({
    queryKey: ["photographers"],
    queryFn: fetchAllPhotographers,
  });
}

export function usePhotographer(id: string | undefined) {
  return useQuery({
    queryKey: ["photographer", id],
    queryFn: () => fetchPhotographerById(id!),
    enabled: !!id,
  });
}
