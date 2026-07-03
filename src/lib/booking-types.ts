import type { Timestamp } from "firebase/firestore";
import type { BookingStatus } from "@/lib/booking-status";
import type { StatusBadgeClasses } from "@/lib/status-badge";

export interface BillboardSnapshot {
  city: string;
  area: string;
  billboardType: string;
  size: string;
  priceRange: string;
  image?: string;
}

export interface Booking {
  id: string;
  userId: string;
  billboardId: string;
  billboardSnapshot: BillboardSnapshot;
  startDate: string;
  endDate: string;
  budget: string;
  goal: string;
  duration: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  campaignDetails: string;
  status: BookingStatus;
  artworkPaths: string[];
  createdAt: Timestamp | null;
  contractAmount?: number;
}

export const STALE_PENDING_DAYS = 7;

// Computed at view-time rather than by a background job — this app has no
// server/scheduled functions (Firestore client SDK only), so "flagging" a
// stale booking just means highlighting it whenever an admin looks at the
// list, rather than a persisted state or a notification.
export function isStalePendingBooking(booking: Booking): boolean {
  if (booking.status !== "pending_payment" || !booking.createdAt) return false;
  const ageMs = Date.now() - booking.createdAt.toDate().getTime();
  return ageMs > STALE_PENDING_DAYS * 24 * 60 * 60 * 1000;
}

export const BOOKING_STATUS_CLASSES: Record<BookingStatus, StatusBadgeClasses> = {
  pending_payment: {
    dot: "bg-gold",
    text: "text-gold",
    bg: "bg-gold/20",
    label: "Pending Payment",
  },
  under_review: {
    dot: "bg-electric-soft",
    text: "text-electric-soft",
    bg: "bg-electric/15",
    label: "Under Review",
  },
  confirmed: {
    dot: "bg-green-500",
    text: "text-green-600",
    bg: "bg-green-500/20",
    label: "Confirmed",
  },
  cancellation_requested: {
    dot: "bg-orange-500",
    text: "text-orange-600",
    bg: "bg-orange-500/20",
    label: "Cancellation Requested",
  },
  cancelled: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    bg: "bg-muted/20",
    label: "Cancelled",
  },
};
