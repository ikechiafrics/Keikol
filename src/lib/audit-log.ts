import { useInfiniteQuery } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Timestamp,
  type WriteBatch,
} from "firebase/firestore";

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

const AUDIT_LOG_PAGE_SIZE = 100;

type Cursor = QueryDocumentSnapshot<DocumentData> | null;

interface AuditLogPage {
  entries: AuditLogEntry[];
  cursor: Cursor;
  hasMore: boolean;
}

// Fetches one page at a time (cursor-based, via startAfter) rather than the
// whole collection — this is an append-only, ever-growing log, so loading
// it in full on every visit would get slower and more expensive forever.
async function fetchAuditLogsPage(cursor: Cursor): Promise<AuditLogPage> {
  const base = [collection(db, "auditLogs"), orderBy("createdAt", "desc")] as const;
  // Fetch one extra document to know whether another page exists, without
  // a separate count query.
  const q = cursor
    ? query(...base, startAfter(cursor), limit(AUDIT_LOG_PAGE_SIZE + 1))
    : query(...base, limit(AUDIT_LOG_PAGE_SIZE + 1));
  const snap = await getDocs(q);
  const hasMore = snap.docs.length > AUDIT_LOG_PAGE_SIZE;
  const docs = hasMore ? snap.docs.slice(0, AUDIT_LOG_PAGE_SIZE) : snap.docs;
  return {
    entries: docs.map((d) => ({ id: d.id, ...d.data() }) as AuditLogEntry),
    cursor: docs.length > 0 ? docs[docs.length - 1] : null,
    hasMore,
  };
}

export function useAuditLogs() {
  return useInfiniteQuery({
    queryKey: ["audit-logs"],
    queryFn: ({ pageParam }: { pageParam: Cursor }) => fetchAuditLogsPage(pageParam),
    initialPageParam: null as Cursor,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor : undefined),
  });
}
