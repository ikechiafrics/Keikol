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

  // Blocks scrolling/interaction with the rest of the page while the choice
  // is undecided — the whole point of a gate is that nothing else is usable
  // until accept or decline is picked.
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

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
    <div className="print:hidden fixed inset-0 z-[1000] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline sm:p-8">
        <Cookie className="h-8 w-8 text-gold" />
        <h2 className="mt-4 font-display text-lg font-bold">Before you continue</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We use cookies to understand site usage and improve your experience. See our{" "}
          <Link
            to="/privacy-policy"
            className="font-semibold text-foreground underline underline-offset-2 hover:text-gold"
          >
            privacy policy
          </Link>{" "}
          for details. Accept or decline to continue.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={handleDecline}
            className="flex-1 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-gold"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
