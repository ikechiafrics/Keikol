import type { Timestamp } from "firebase/firestore";
import type { QuoteStatus } from "@/lib/quote-status";
import type { StatusBadgeClasses } from "@/lib/status-badge";

export interface QuoteRequest {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  billboardType: string;
  budget: string;
  duration: string;
  goal: string;
  message: string;
  billboardId: string;
  interestedBillboard: string;
  status: QuoteStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export const QUOTE_STATUS_CLASSES: Record<QuoteStatus, StatusBadgeClasses> = {
  new: { dot: "bg-gold", text: "text-gold", bg: "bg-gold/20", label: "New" },
  contacted: { dot: "bg-electric-soft", text: "text-electric-soft", bg: "bg-electric/15", label: "Contacted" },
  closed: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/20", label: "Closed" },
};
