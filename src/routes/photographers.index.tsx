import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar as CalendarIcon,
  Camera,
  CheckCircle2,
  Film,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "sonner";

import { Section, SectionHeader } from "@/components";
import { Field } from "@/components/FormField";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { db } from "@/lib/firebase";
import { trackEvent } from "@/lib/analytics";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
import corporateImg from "@/assets/photo-corporate.jpg";
import landscapeImg from "@/assets/photo-landscape.jpg";
import realestateImg from "@/assets/photo-realestate.jpg";
import interiorImg from "@/assets/photo-interior.jpg";
import weddingImg from "@/assets/photo-wedding.jpg";
import birthdayImg from "@/assets/photo-birthday.jpg";
import babyshowerImg from "@/assets/photo-babyshower.jpg";
import graduationImg from "@/assets/photo-graduation.jpg";
import heroImg from "@/assets/camera.jpg";

export const Route = createFileRoute("/photographers/")({
  head: () => ({
    meta: [
      { title: "Photography & Videography — Keikol" },
      {
        name: "description",
        content:
          "Editorial photography and videography for weddings, corporate, real estate, interiors, and life's moments — booked through Keikol's curated creator network.",
      },
      { property: "og:title", content: "Photography & Videography — Keikol" },
      {
        property: "og:description",
        content:
          "Editorial photography and videography for weddings, corporate, real estate, interiors, and life's moments — booked through Keikol's curated creator network.",
      },
    ],
  }),
  component: PhotographersPage,
});

type Occasion = {
  title: string;
  blurb: string;
  image: string;
  span?: "wide" | "tall";
};

const OCCASIONS: Occasion[] = [
  {
    title: "Weddings",
    blurb: "Cinematic coverage of the day, from getting-ready to last dance.",
    image: weddingImg,
    span: "wide",
  },
  {
    title: "Corporate Shots",
    blurb: "Executive portraits, team culture, and brand assets.",
    image: corporateImg,
  },
  {
    title: "Landscape Photography",
    blurb: "Sweeping outdoor imagery for campaigns and travel brands.",
    image: landscapeImg,
  },
  {
    title: "Real Estate Coverage",
    blurb: "Property stills and walkthroughs that sell the space.",
    image: realestateImg,
    span: "tall",
  },
  {
    title: "Interior Design",
    blurb: "Editorial interiors for designers, hotels, and studios.",
    image: interiorImg,
  },
  {
    title: "Birthdays",
    blurb: "Candid, colourful storytelling of the night.",
    image: birthdayImg,
  },
  {
    title: "Baby Showers",
    blurb: "Soft, tender frames of the pre-arrival celebration.",
    image: babyshowerImg,
  },
  {
    title: "Graduations",
    blurb: "Milestone portraits and family group shots.",
    image: graduationImg,
  },
];

function PhotographersPage() {
  return (
    <>
      <PhotoHero />
      <OccasionsGrid />
      <ProcessStrip />
      <QuoteSection />
    </>
  );
}

function PhotoHero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/70 to-background" />
      </div>
      <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          <Camera className="h-3.5 w-3.5 text-gold" />
          Photography & Videography
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
          Frame the moments <br />
          <span className="text-gradient-gold">worth keeping.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A curated network of photographers and videographers across Nigeria —
          matched to your brand, budget, and occasion. Editorial-quality frames
          for weddings, business, property, and life's big days.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#quote"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Request a Quote <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#occasions"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:border-accent hover:text-accent"
          >
            Browse occasions
          </a>
        </div>
      </div>
    </section>
  );
}

function OccasionsGrid() {
  return (
    <Section id="occasions">
      <SectionHeader
        eyebrow="What we shoot"
        title={
          <>
            Eight occasions. <span className="text-gradient-gold">One standard.</span>
          </>
        }
        subtitle="Every category is handled by creators briefed on the Keikol quality bar — colour, composition, delivery. Pick the moment you need covered."
      />
      <div className="mt-14 grid auto-rows-[260px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {OCCASIONS.map((o) => (
          <OccasionCard key={o.title} occasion={o} />
        ))}
      </div>
    </Section>
  );
}

function OccasionCard({ occasion }: { occasion: Occasion }) {
  const span =
    occasion.span === "wide"
      ? "sm:col-span-2 sm:row-span-1"
      : occasion.span === "tall"
        ? "lg:row-span-2"
        : "";
  return (
    <a
      href="#quote"
      className={`group relative overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all duration-500 hover:-translate-y-1 hover:shadow-glow ${span}`}
    >
      <img
        src={occasion.image}
        alt={occasion.title}
        loading="lazy"
        width={1024}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
          Keikol · Photo
        </p>
        <h3 className="mt-1.5 font-display text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
          {occasion.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
          {occasion.blurb}
        </p>
      </div>
      <div className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-background/60 text-foreground backdrop-blur transition-all group-hover:bg-gold group-hover:text-primary-foreground">
        <ArrowRight className="h-4 w-4" />
      </div>
    </a>
  );
}

function ProcessStrip() {
  const steps = [
    {
      icon: Sparkles,
      title: "Tell us the brief",
      body: "Occasion, date, city, mood. Ten fields, five minutes.",
    },
    {
      icon: Camera,
      title: "We match a creator",
      body: "Vetted photographer or videographer from our network.",
    },
    {
      icon: Film,
      title: "Delivered on-brand",
      body: "Edited stills and cuts, ready for launch or the album.",
    },
  ];
  return (
    <Section tone="surface">
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <div
            key={title}
            className="relative rounded-2xl bg-card-premium p-7 shadow-elegant ring-hairline"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-electric text-accent-foreground shadow-glow">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                Step {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
              {title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function QuoteSection() {
  return (
    <Section id="quote">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader
            align="left"
            eyebrow="Request a quote"
            title={
              <>
                Tell us about your <span className="text-gradient-gold">shoot.</span>
              </>
            }
            subtitle="A few quick taps — no long form. Share what you can, and our team will match you with the right creator, timeline, and package, usually within 24 hours."
          />
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "No obligation, no pushy sales.",
              "Transparent pricing after the brief.",
              "One point of contact, from brief to delivery.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Prefer to just reach out directly?</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="mailto:info@keikol.com"
                className="inline-flex items-center gap-2 text-gold hover:underline"
              >
                <Mail className="h-4 w-4" /> info@keikol.com
              </a>
              <a
                href="tel:+234"
                className="inline-flex items-center gap-2 text-gold hover:underline"
              >
                <Phone className="h-4 w-4" /> +234 XXX XXX XXXX
              </a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          <QuoteWizard />
        </div>
      </div>
    </Section>
  );
}

const OCCASION_OPTIONS = [...OCCASIONS.map((o) => o.title), "Other / Not Sure"];
const TOTAL_STEPS = 3;

// A short 3-step tap-through instead of one long form — same fields, same
// Firestore write, but asking one thing at a time is what actually lowers
// the perceived effort of filling this in.
function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (website) {
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
        serviceType: "photography_videography",
        photographerId: "",
        interestedPhotographer: "General Photography & Videography Inquiry",
        occasion,
        preferredDate,
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
          Your photography request is in. The Keikol team will reach out within 24 hours to match you with a creator.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setOccasion("");
            setPreferredDate("");
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
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
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
          <h3 className="mb-4 font-display text-lg font-bold">What are we shooting?</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {OCCASION_OPTIONS.map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => setOccasion(title)}
                className={`rounded-xl border px-3 py-3 text-center text-xs font-semibold transition-colors ${
                  occasion === title
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                }`}
              >
                {title}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!occasion}
            onClick={() => setStep(2)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="mb-4 font-display text-lg font-bold">When's the shoot?</h3>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Preferred date (optional)
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm hover:border-gold focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                <span className={preferredDate ? "" : "text-muted-foreground/70"}>
                  {preferredDate || "Select a date"}
                </span>
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={preferredDate ? new Date(`${preferredDate}T00:00:00`) : undefined}
                onSelect={(date) => setPreferredDate(date ? toISODate(date) : "")}
              />
            </PopoverContent>
          </Popover>
          <p className="mt-2 text-xs text-muted-foreground">
            Not sure yet? Leave it blank — we can work out timing together.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
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
                htmlFor="f-message"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Tell us about the shoot (optional)
              </label>
              <textarea
                id="f-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="City, vibe, deliverables — whatever you have so far."
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
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
