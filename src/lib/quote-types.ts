import type { Timestamp } from "firebase/firestore";
import type { QuoteStatus } from "@/lib/quote-status";
import type { StatusBadgeClasses } from "@/lib/status-badge";

export type QuoteService = "billboard" | "photography_videography";

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: QuoteStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  // Billboard-shaped fields (present on billboard-quote submissions).
  company?: string;
  city?: string;
  billboardType?: string;
  budget?: string;
  duration?: string;
  goal?: string;
  billboardId?: string;
  interestedBillboard?: string;
  // Photography/videography-shaped fields (present on those submissions).
  // Named serviceType, not service — "service" is a reserved keyword in the
  // Firestore Rules grammar (it's what declares `service cloud.firestore {}`),
  // and using it as a field name there fails to parse.
  serviceType?: QuoteService;
  photographerId?: string;
  interestedPhotographer?: string;
}

export const QUOTE_STATUS_CLASSES: Record<QuoteStatus, StatusBadgeClasses> = {
  new: { dot: "bg-gold", text: "text-gold", bg: "bg-gold/20", label: "New" },
  contacted: { dot: "bg-electric-soft", text: "text-electric-soft", bg: "bg-electric/15", label: "Contacted" },
  closed: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/20", label: "Closed" },
};
