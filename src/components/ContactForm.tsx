import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Field } from "./FormField";

export function ContactForm({
  interestedBillboard = "Not sure yet",
  billboardId,
}: {
  interestedBillboard?: string;
  billboardId?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      const existing = JSON.parse(localStorage.getItem("keikol_quote_submissions") || "[]");
      existing.push({ ...data, submittedAt: new Date().toISOString() });
      localStorage.setItem("keikol_quote_submissions", JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-3xl bg-card-premium p-10 text-center shadow-elegant ring-hairline">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold shadow-gold">
          <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold">Thank you.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Your quote request has been received. The Keikol team will review your campaign details and contact you soon.
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
    <form onSubmit={onSubmit} className="rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline sm:p-9">
      <input type="hidden" name="billboardId" value={billboardId ?? ""} />
      <div className="mb-4 rounded-xl border border-border bg-surface/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Interested Billboard</p>
        <p className="mt-1 text-sm font-semibold">{interestedBillboard}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" name="name" placeholder="Your full name" />
        <Field label="Company Name" name="company" placeholder="Company / brand" />
        <Field label="Email Address" name="email" type="email" placeholder="you@brand.com" />
        <Field label="Phone Number" name="phone" placeholder="+234 ..." />
        <Field label="City of Interest" name="city" placeholder="Lagos, Abuja, ..." />
        <SelectField
          label="Preferred Billboard Type"
          name="billboardType"
          options={["Digital Billboard", "Static Billboard", "Premium Static Billboard", "Not Sure Yet"]}
        />
        <SelectField
          label="Campaign Budget"
          name="budget"
          options={["Below ₦500,000", "₦500,000 – ₦1,000,000", "₦1,000,000 – ₦2,000,000", "₦2,000,000+", "Not Sure Yet"]}
        />
        <SelectField
          label="Campaign Duration"
          name="duration"
          options={["1 Week", "2 Weeks", "1 Month", "3 Months", "Not Sure Yet"]}
        />
        <div className="sm:col-span-2">
          <SelectField
            label="Campaign Goal"
            name="goal"
            options={["Brand Awareness", "Product Launch", "Event Promotion", "Store/Branch Launch", "Political/Public Awareness", "Not Sure Yet"]}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-message" className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Message / Campaign Details
          </label>
          <textarea
            id="f-message"
            name="message"
            rows={4}
            required
            placeholder="Tell us about your campaign goals..."
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          Send Quote Request <ArrowRight className="h-4 w-4" />
        </button>
        <p className="sm:col-span-2 text-center text-[11px] text-muted-foreground">
          This form is currently set up for demo submission. Email and backend integration can be connected later.
        </p>
      </div>
    </form>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <select
        id={id}
        name={name}
        required
        defaultValue=""
        className="w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      >
        <option value="" disabled>Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function ContactSidebar() {
  return (
    <aside className="flex flex-col gap-4">
      {[
        { icon: Mail, label: "Email", value: "info@keikolmedia.com", href: "mailto:info@keikolmedia.com" },
        { icon: Phone, label: "Phone", value: "+234 XXX XXX XXXX", href: "tel:+234" },
        { icon: MapPin, label: "Location", value: "Nigeria", href: "#" },
      ].map(({ icon: Icon, label, value, href }) => (
        <a
          key={label}
          href={href}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card-premium p-5 transition-all hover:-translate-y-0.5 hover:border-gold/40"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-electric text-accent-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
          </div>
        </a>
      ))}
      <a
        href="https://wa.me/2340000000000"
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 text-sm font-semibold text-white shadow-elegant transition-transform hover:-translate-y-0.5"
      >
        <MessageCircle className="h-5 w-5" />
        Chat on WhatsApp
      </a>
      <div className="rounded-2xl border border-border bg-surface/40 p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Keikol Media Group Ltd</p>
        <p className="mt-1">A modern advertising and media company focused on premium outdoor advertising across Nigeria.</p>
      </div>
    </aside>
  );
}
