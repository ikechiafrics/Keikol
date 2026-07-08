import type { Timestamp } from "firebase/firestore";
import type { StatusBadgeClasses } from "@/lib/status-badge";

export type PhotographyBookingStatus = "confirmed" | "completed" | "cancelled";

export interface PhotographyBooking {
  id: string;
  quoteRequestId: string; // "" if created directly, not converted from a lead
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  occasion: string;
  eventDate: string; // "YYYY-MM-DD", may be blank if not yet fixed
  location: string; // venue/address, free text
  notes: string; // package/deliverables/whatever was discussed on the call
  status: PhotographyBookingStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export const PHOTOGRAPHY_BOOKING_STATUS_CLASSES: Record<PhotographyBookingStatus, StatusBadgeClasses> = {
  confirmed: { dot: "bg-gold", text: "text-gold", bg: "bg-gold/20", label: "Confirmed" },
  completed: { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-500/20", label: "Completed" },
  cancelled: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/20", label: "Cancelled" },
};
