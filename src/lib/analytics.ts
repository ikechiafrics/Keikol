import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "@/lib/firebase";

export function trackEvent(name: string, params?: Record<string, unknown>) {
  const analytics = getAnalyticsInstance();
  if (!analytics) return;
  logEvent(analytics, name, params);
}
