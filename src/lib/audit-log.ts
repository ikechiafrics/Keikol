import { useQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type WriteBatch,
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: Timestamp | null;
}

export interface AuditActor {
  uid: string;
  email: string | null | undefined;
}

// Queues an audit-log write inside an already-open batch, so the log entry
// commits atomically with the action it describes — the two can never
// drift apart from a partial write.
export function logAudit(
  batch: WriteBatch,
  actor: AuditActor,
  entry: { action: string; targetType: string; targetId: string; summary: string },
): void {
  batch.set(doc(collection(db, "auditLogs")), {
    actorUid: actor.uid,
    actorEmail: actor.email ?? "",
    ...entry,
    createdAt: serverTimestamp(),
  });
}

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogEntry);
}

export function useAuditLogs() {
  return useQuery({ queryKey: ["audit-logs"], queryFn: fetchAuditLogs });
}
