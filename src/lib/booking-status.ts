// Shared with src/routes/_authed.dashboard.tsx (reads bookings) and
// src/routes/_authed.book.$id.tsx (creates bookings). firestore.rules
// independently hardcodes "pending_payment" as a literal since Firestore
// rules can't import TypeScript types — keep that string in sync by hand.
export type BookingStatus = "pending_payment" | "under_review" | "confirmed" | "cancelled";
