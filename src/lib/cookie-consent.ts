// Three states, not a boolean — "undecided" is what triggers showing the
// banner at all; it is distinct from an explicit "declined".
export type CookieConsent = "accepted" | "declined" | "undecided";

const STORAGE_KEY = "keikol-cookie-consent";

export function getStoredConsent(): CookieConsent {
  if (typeof window === "undefined") return "undecided";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "accepted" || raw === "declined" ? raw : "undecided";
}

export function setStoredConsent(consent: "accepted" | "declined"): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, consent);
}
