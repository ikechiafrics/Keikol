// Shared with src/components/ContactForm.tsx (forces "new" on create) and
// src/routes/_authed.admin.quotes.tsx (admin status updates). firestore.rules
// independently hardcodes these as literals since rules can't import TS types —
// keep them in sync by hand.
export type QuoteStatus = "new" | "contacted" | "closed";
