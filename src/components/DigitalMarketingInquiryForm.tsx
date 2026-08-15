import { useState, type FormEvent } from "react";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Field } from "./FormField";
import { db } from "@/lib/firebase";
import { trackEvent } from "@/lib/analytics";

// Shared with the page's platforms grid so both stay in sync from one
// source of truth instead of two independently-typed lists.
export const PLATFORM_OPTIONS = ["Meta", "Google", "Snapchat", "TikTok", "AI Search"];

const TOTAL_STEPS = 2;

// A short 2-step tap-through rather than one long form, same "ease the
// process" reasoning as the photography quote wizard on /photographers.
export function DigitalMarketingInquiryForm() {
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (honeypot) {
      setSubmitted(true);
      return;
    }

    setSubmitting(true);
    try {
      await setDoc(doc(collection(db, "quoteRequests")), {
        name,
        email,
        phone,
        message,
        serviceType: "digital_marketing",
        businessName,
        website,
        platforms,
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
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setPlatforms([]);
            setBusinessName("");
            setWebsite("");
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
          }}
          className="mt-6 text-sm font-semibold text-gold hover:underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline sm:p-9">
      <input
        type="text"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-gold" : "bg-surface-2"}`}
          />
        ))}
      </div>
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Step {step} of {TOTAL_STEPS}
      </p>

      {step === 1 && (
        <div>
          <h3 className="mb-4 font-display text-lg font-bold">Which platforms interest you?</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {PLATFORM_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition-colors ${
                  platforms.includes(p)
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label="Business Name"
              name="businessName"
              placeholder="Your business"
              value={businessName}
              onChange={setBusinessName}
            />
            <Field
              label="Website"
              name="website"
              placeholder="yourbusiness.com"
              value={website}
              onChange={setWebsite}
            />
          </div>

          <button
            type="button"
            disabled={platforms.length === 0 || !businessName}
            onClick={() => setStep(2)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={onSubmit}>
          <h3 className="mb-4 font-display text-lg font-bold">Tell us how to reach you.</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" name="name" placeholder="Your full name" value={name} onChange={setName} />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@brand.com"
              value={email}
              onChange={setEmail}
            />
            <div className="sm:col-span-2">
              <Field label="Phone" name="phone" placeholder="+234 ..." value={phone} onChange={setPhone} />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="dm-message"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Tell us about your goals (optional)
              </label>
              <textarea
                id="dm-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Target audience, budget range, timeline — whatever you have so far."
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting || !name || !email}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Sending…" : "Send request"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
