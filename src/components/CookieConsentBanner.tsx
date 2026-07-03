import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

import { getStoredConsent, setStoredConsent } from "@/lib/cookie-consent";
import { initAnalytics } from "@/lib/firebase";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent === "accepted") {
      // Returning visitor who already consented — start tracking silently,
      // no banner shown.
      initAnalytics();
    } else if (consent === "undecided") {
      setVisible(true);
    }
    // "declined" — do nothing; banner stays hidden, analytics never inits.
  }, []);

  function handleAccept() {
    setStoredConsent("accepted");
    initAnalytics();
    setVisible(false);
  }

  function handleDecline() {
    setStoredConsent("declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="print:hidden fixed inset-x-0 bottom-0 z-[1000] p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl bg-card-premium p-5 shadow-elegant ring-hairline sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 flex-none text-gold" />
          <p className="text-sm text-muted-foreground">
            We use cookies to understand site usage and improve your experience. See our{" "}
            <Link
              to="/privacy-policy"
              className="font-semibold text-foreground underline underline-offset-2 hover:text-gold"
            >
              privacy policy
            </Link>{" "}
            for details.
          </p>
        </div>
        <div className="flex flex-none items-center gap-3">
          <button
            onClick={handleDecline}
            className="rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-gold"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
