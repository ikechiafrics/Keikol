import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "sonner";

import { Field } from "./FormField";
import { db } from "@/lib/firebase";
import { trackEvent } from "@/lib/analytics";
import type { Photographer } from "@/lib/photographer-types";

// A lightweight quote submission distinct from the billboard ContactForm —
// the field sets don't overlap enough (no billboard type/Naira budget tiers)
// to share one form without a lot of conditional rendering.
export function PhotographerInquiryForm({ photographer }: { photographer: Photographer }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries()) as Record<string, string>;

    if (data.website) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      await setDoc(doc(collection(db, "quoteRequests")), {
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        message: data.message ?? "",
        serviceType: "photography_videography",
        photographerId: photographer.id,
        interestedPhotographer: photographer.name,
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      trackEvent("quote_request_submitted");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong sending your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl bg-card-premium p-10 text-center shadow-elegant ring-hairline">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold shadow-gold">
          <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold">Thank you.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Your request has been received. The Keikol team will follow up soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold text-gold hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline sm:p-9"
    >
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mb-4 rounded-xl border border-border bg-surface/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Requesting a quote from
        </p>
        <p className="mt-1 text-sm font-semibold">{photographer.name}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" name="name" placeholder="Your full name" />
        <Field label="Email Address" name="email" type="email" placeholder="you@email.com" />
        <div className="sm:col-span-2">
          <Field label="Phone Number" name="phone" placeholder="+1 ..." />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="pi-message"
            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Tell us about your event/project
          </label>
          <textarea
            id="pi-message"
            name="message"
            rows={4}
            required
            placeholder="Event type, preferred date, location, and any other details..."
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {submitting ? "Sending…" : "Send Quote Request"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
