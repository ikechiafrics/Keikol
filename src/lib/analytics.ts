import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!analytics) return;
  logEvent(analytics, name, params);
}
