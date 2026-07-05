import type { Timestamp } from "firebase/firestore";

export type PhotographerSpecialty = "Photography" | "Videography";
export const SPECIALTIES: PhotographerSpecialty[] = ["Photography", "Videography"];

// Extensible list rather than a hardcoded single currency — unlike billboards
// (Nigeria-only, always Naira), partnered photographers/videographers can be
// based in different countries and paid in their own local currency.
export const CURRENCY_OPTIONS = ["NGN", "USD", "GBP", "CAD", "EUR"] as const;
export type Currency = (typeof CURRENCY_OPTIONS)[number];

export interface Photographer {
  id: string;
  name: string;
  bio: string;
  specialties: PhotographerSpecialty[];
  city: string;
  country: string;
  currency: Currency;
  rateNote: string; // free text, e.g. "From $150/hr" or "Contact for rate"
  profileImage: string;
  portfolioImages: string[];
  videoLinks: string[]; // external YouTube/Vimeo URLs — no self-hosted video in this phase
  active: boolean; // hide from the public directory without deleting the profile
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}
