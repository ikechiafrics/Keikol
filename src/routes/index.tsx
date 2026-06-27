import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  Gauge,
  Globe2,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Sparkles,
  Star,
  Zap,
  Building2,
  Landmark,
  Radio,
  Utensils,
  ShoppingBag,
  Shirt,
  GraduationCap,
  PartyPopper,
  Vote,
  Cpu,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";

import heroImg from "@/assets/hero-billboard.jpg";
import locLagos from "@/assets/loc-lagos.jpg";
import locAbuja from "@/assets/loc-abuja.jpg";
import locPh from "@/assets/loc-ph.jpg";
import locKano from "@/assets/loc-kano.jpg";
import campRealEstate from "@/assets/camp-realestate.jpg";
import campRestaurant from "@/assets/camp-restaurant.jpg";
import campTelecom from "@/assets/camp-telecom.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keikol — Modern Billboard Advertising in Nigeria" },
      {
        name: "description",
        content:
          "Premium billboard placements, outdoor media, and technology-driven advertising campaigns across Nigeria.",
      },
      { property: "og:title", content: "Keikol — Modern Billboard Advertising in Nigeria" },
      {
        property: "og:description",
        content:
          "Premium billboard placements, outdoor media, and technology-driven advertising campaigns across Nigeria.",
      },
    ],
  }),
  component: LandingPage,
});

/* ---------------- NAV ---------------- */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Billboard Locations", href: "#locations" },
  { label: "Industries", href: "#industries" },
  { label: "Why Keikol", href: "#why" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#home" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gold shadow-gold ring-hairline">
        <span className="font-display text-base font-extrabold text-primary-foreground">K</span>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-electric shadow-glow" />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        Keikol
      </span>
    </a>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden lg:block">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Book a Billboard <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-gold"
            >
              Book a Billboard <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- HERO ---------------- */

function Hero() {
  return (
    <section id="home" className="relative isolate overflow-hidden bg-hero pt-32 lg:pt-40">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Premium digital billboard glowing over a Lagos highway at night"
          width={1920}
          height={1280}
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-32">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Premium outdoor advertising across Nigeria
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Modern Billboard Advertising for{" "}
            <span className="text-gradient-gold">Brands That Want to Be Seen</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Keikol helps businesses grow through premium outdoor advertising, strategic
            billboard placements, and technology-driven media solutions across Nigeria.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#locations"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Explore Billboard Locations <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent hover:text-accent"
            >
              Request a Quote
            </a>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: MapPin, label: "Premium Locations" },
              { icon: CheckCircle2, label: "Transparent Booking" },
              { icon: Headphones, label: "Campaign Support" },
              { icon: Cpu, label: "Future AI Analytics" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-3 py-2.5 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                <Icon className="h-4 w-4 text-gold" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Floating billboard card */}
        <div className="relative hidden lg:block">
          <div className="animate-float-slow relative ml-auto w-full max-w-md overflow-hidden rounded-3xl bg-card-premium p-1 shadow-elegant ring-hairline">
            <div className="overflow-hidden rounded-[1.35rem]">
              <img
                src={heroImg}
                alt="Featured Keikol billboard placement"
                width={1024}
                height={768}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Featured placement
                </p>
                <p className="mt-1 font-display text-lg font-bold">Lekki Expressway · Lagos</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
                Live
              </span>
            </div>
          </div>
          <div className="absolute -left-6 bottom-10 rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-xl shadow-elegant">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Daily reach</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-gradient-gold">
              120,000+
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- MISSION & VISION ---------------- */

function MissionVision() {
  return (
    <Section id="mission">
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          {
            tag: "Our Mission",
            icon: Zap,
            title: "Make outdoor advertising effortless.",
            body:
              "To make outdoor advertising more accessible, transparent, and effective for businesses through premium billboard placements and seamless digital experiences.",
            accent: "gold",
          },
          {
            tag: "Our Vision",
            icon: Globe2,
            title: "Africa's smart media infrastructure.",
            body:
              "To become one of Africa's leading technology-enabled advertising and media infrastructure companies — combining outdoor media, digital platforms, AI, automation, and smart advertising systems.",
            accent: "electric",
          },
        ].map(({ tag, icon: Icon, title, body, accent }) => (
          <article
            key={tag}
            className="group relative overflow-hidden rounded-3xl bg-card-premium p-8 shadow-elegant ring-hairline transition-transform hover:-translate-y-1"
          >
            <div
              className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl transition-opacity group-hover:opacity-80 ${
                accent === "gold" ? "bg-gold/20" : "bg-accent/25"
              }`}
            />
            <div className="relative">
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                  accent === "gold" ? "bg-gold text-primary-foreground" : "bg-electric text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {tag}
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- LOCATIONS ---------------- */

const LOCATIONS = [
  {
    city: "Lagos",
    area: "Lekki Expressway",
    type: "Digital Billboard",
    impressions: "120,000+",
    status: "Available",
    img: locLagos,
  },
  {
    city: "Abuja",
    area: "Central Business District",
    type: "Static Billboard",
    impressions: "85,000+",
    status: "Available",
    img: locAbuja,
  },
  {
    city: "Port Harcourt",
    area: "Aba Road",
    type: "Digital Billboard",
    impressions: "70,000+",
    status: "Coming Soon",
    img: locPh,
  },
  {
    city: "Kano",
    area: "Commercial District",
    type: "Static Billboard",
    impressions: "60,000+",
    status: "Coming Soon",
    img: locKano,
  },
];

function Locations() {
  return (
    <Section id="locations">
      <SectionHeader
        eyebrow="Featured Billboard Locations"
        title={
          <>
            High-visibility spaces that{" "}
            <span className="text-gradient-gold">reach the right audience.</span>
          </>
        }
        subtitle="Discover premium advertising locations across Nigeria's most strategic urban corridors."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {LOCATIONS.map((l) => {
          const available = l.status === "Available";
          return (
            <article
              key={l.area}
              className="group flex flex-col overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={l.img}
                  alt={`${l.type} in ${l.area}, ${l.city}`}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <span
                  className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${
                    available
                      ? "bg-accent/20 text-accent"
                      : "bg-gold/20 text-gold"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      available ? "bg-accent" : "bg-gold"
                    }`}
                  />
                  {l.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  {l.city}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">{l.area}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{l.type}</p>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-accent" />
                  <span className="font-semibold">{l.impressions}</span>
                  <span className="text-muted-foreground">daily impressions</span>
                </div>
                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center justify-between rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
                >
                  View Details
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          View All Locations <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Section>
  );
}

/* ---------------- WHY KEIKOL ---------------- */

const WHY = [
  {
    icon: Eye,
    title: "Premium Visibility",
    body: "High-impact billboard locations designed to place your brand in front of large audiences.",
  },
  {
    icon: CheckCircle2,
    title: "Transparent Advertising",
    body: "Clear information, straightforward communication, and a more modern advertising experience.",
  },
  {
    icon: Cpu,
    title: "Technology-Driven Approach",
    body: "Built with a long-term vision for online booking, analytics, automation, and AI-powered campaign tools.",
  },
  {
    icon: Headphones,
    title: "Customer-Focused Experience",
    body: "A smoother process from inquiry to campaign launch, with support at every step.",
  },
  {
    icon: Globe2,
    title: "Scalable Media Network",
    body: "Starting with billboard advertising and growing into a nationwide smart media infrastructure platform.",
  },
  {
    icon: Sparkles,
    title: "Modern Brand Presentation",
    body: "Professional advertising solutions for businesses that want to look credible, visible, and competitive.",
  },
];

function WhyKeikol() {
  return (
    <Section id="why" tone="surface">
      <SectionHeader
        eyebrow="Why Keikol"
        title={
          <>
            Why brands choose <span className="text-gradient-gold">Keikol.</span>
          </>
        }
        subtitle="Built for advertisers who expect modern tools, premium placements, and dependable execution."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WHY.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:bg-gold/15" />
            <div className="relative">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-electric text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- INDUSTRIES ---------------- */

const INDUSTRIES = [
  { icon: Building2, label: "Real Estate" },
  { icon: Landmark, label: "Banking & Finance" },
  { icon: Radio, label: "Telecom" },
  { icon: Utensils, label: "Restaurants" },
  { icon: ShoppingBag, label: "FMCG" },
  { icon: Shirt, label: "Fashion" },
  { icon: GraduationCap, label: "Education" },
  { icon: PartyPopper, label: "Events" },
  { icon: Vote, label: "Politics" },
  { icon: Cpu, label: "Technology" },
];

function Industries() {
  return (
    <Section id="industries">
      <SectionHeader
        eyebrow="Industries We Serve"
        title={
          <>
            Industries we{" "}
            <span className="text-gradient-electric">help grow.</span>
          </>
        }
        subtitle="From real estate launches to telecom campaigns — Keikol delivers visibility where it matters."
      />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {INDUSTRIES.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card-premium p-5 text-center shadow-elegant transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- STATS ---------------- */

const STATS = [
  { value: "5+", label: "Major Cities Targeted" },
  { value: "50K+", label: "Estimated Daily Impressions Per Location" },
  { value: "24/7", label: "Brand Visibility" },
  { value: "100%", label: "Customer-Focused Campaign Support" },
];

function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-2xl bg-card-premium p-6 text-center shadow-elegant ring-hairline transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <p className="font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">
        {value}
      </p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Stats() {
  return (
    <Section id="stats" tone="surface">
      <SectionHeader
        eyebrow="Impact"
        title={
          <>
            Built to deliver{" "}
            <span className="text-gradient-gold">measurable reach.</span>
          </>
        }
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCounter key={s.label} {...s} />
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Statistics are early estimates and may be updated as Keikol expands its billboard network.
      </p>
    </Section>
  );
}

/* ---------------- PORTFOLIO ---------------- */

const PORTFOLIO = [
  {
    img: campRealEstate,
    category: "Real Estate Launch",
    location: "Lagos",
    type: "Billboard Awareness Campaign",
  },
  {
    img: campRestaurant,
    category: "Restaurant Promotion",
    location: "Abuja",
    type: "Outdoor Visibility Campaign",
  },
  {
    img: campTelecom,
    category: "Telecom Brand Push",
    location: "Port Harcourt",
    type: "High-Traffic Media Campaign",
  },
];

function Portfolio() {
  return (
    <Section id="portfolio">
      <SectionHeader
        eyebrow="Portfolio"
        title={
          <>
            Campaigns that{" "}
            <span className="text-gradient-gold">command attention.</span>
          </>
        }
        subtitle="A glimpse of the kind of high-impact outdoor work Keikol delivers for ambitious brands."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {PORTFOLIO.map((c) => (
          <article
            key={c.category}
            className="group overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-[5/4] overflow-hidden">
              <img
                src={c.img}
                alt={`${c.category} in ${c.location}`}
                loading="lazy"
                width={1024}
                height={768}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {c.location}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">{c.category}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between p-5">
              <p className="text-sm text-muted-foreground">{c.type}</p>
              <ChevronRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a
          href="#contact"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          Start Your Campaign <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </Section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */

const TESTIMONIALS = [
  {
    quote:
      "Keikol gives brands a modern way to access premium billboard advertising with clarity and confidence.",
    name: "Marketing Director",
    role: "Real Estate Brand",
  },
  {
    quote:
      "The placements felt thoughtfully chosen for our audience — exactly the visibility our restaurant needed.",
    name: "Founder",
    role: "Restaurant Group",
  },
  {
    quote:
      "A refreshingly straightforward partner for outdoor media. Communication and execution were seamless.",
    name: "Brand Manager",
    role: "FMCG Company",
  },
];

function Testimonials() {
  return (
    <Section id="testimonials" tone="surface">
      <SectionHeader
        eyebrow="Trusted Words"
        title={
          <>
            What partners say about{" "}
            <span className="text-gradient-electric">working with Keikol.</span>
          </>
        }
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name + t.role}
            className="relative flex flex-col rounded-2xl bg-card-premium p-7 shadow-elegant ring-hairline"
          >
            <Quote className="h-7 w-7 text-gold/70" />
            <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/90">
              "{t.quote}"
            </blockquote>
            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold text-sm font-bold text-primary-foreground">
                {t.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <figcaption className="truncate text-sm font-semibold">{t.name}</figcaption>
                <p className="truncate text-xs text-muted-foreground">{t.role}</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
            </div>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- BIG CTA ---------------- */

function MainCTA() {
  return (
    <Section id="cta">
      <div className="relative overflow-hidden rounded-3xl bg-card-premium p-10 shadow-elegant ring-hairline sm:p-14">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Gauge className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to put your brand in front of{" "}
            <span className="text-gradient-gold">thousands every day?</span>
          </h2>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">
            Start your next outdoor advertising campaign with Keikol and discover billboard
            placements built for visibility, credibility, and growth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Request a Quote <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- CONTACT ---------------- */

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Section id="contact" tone="surface">
      <SectionHeader
        eyebrow="Contact"
        title={
          <>
            Let's plan your{" "}
            <span className="text-gradient-gold">next campaign.</span>
          </>
        }
        subtitle="Tell us about your goals and our team will get back with the best billboard options for your brand."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline sm:p-9">
          {submitted ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gold shadow-gold">
                <CheckCircle2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">Thanks — message received.</h3>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                A Keikol campaign specialist will reach out shortly with recommended billboard
                placements and pricing for your brand.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-semibold text-gold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" name="name" placeholder="Your full name" />
              <Field label="Company Name" name="company" placeholder="Company / brand" />
              <Field label="Email Address" name="email" type="email" placeholder="you@brand.com" />
              <Field label="Phone Number" name="phone" placeholder="+234 ..." />
              <Field label="City of Interest" name="city" placeholder="Lagos, Abuja, ..." />
              <Field label="Campaign Budget" name="budget" placeholder="₦ Range" />
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us about your campaign goals..."
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                Send Inquiry <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

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
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </p>
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
        </aside>
      </div>
    </Section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
    </div>
  );
}

/* ---------------- FOOTER ---------------- */

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Keikol is a modern advertising and media brand helping businesses grow through
              premium billboard placements, outdoor media, and future technology-driven
              campaign solutions.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Quick Links"
            items={[
              { label: "Home", href: "#home" },
              { label: "Billboard Locations", href: "#locations" },
              { label: "Why Keikol", href: "#why" },
              { label: "Portfolio", href: "#portfolio" },
            ]}
          />
          <FooterCol
            title="Services"
            items={[
              { label: "Digital Billboards", href: "#locations" },
              { label: "Static Billboards", href: "#locations" },
              { label: "Outdoor Campaigns", href: "#portfolio" },
              { label: "Industries", href: "#industries" },
            ]}
          />
          <FooterCol
            title="Contact"
            items={[
              { label: "info@keikolmedia.com", href: "mailto:info@keikolmedia.com" },
              { label: "+234 XXX XXX XXXX", href: "tel:+234" },
              { label: "Nigeria", href: "#contact" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Keikol Media Group Ltd. All rights reserved.</p>
          <p>Built for brands that want to be seen.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
        {title}
      </h4>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i.label}>
            <a
              href={i.href}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- LAYOUT HELPERS ---------------- */

function Section({
  id,
  children,
  tone = "default",
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "default" | "surface";
}) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-28 ${
        tone === "surface" ? "bg-surface/40" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">{children}</div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-1 w-1 rounded-full bg-gold" />
        {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ---------------- PAGE ---------------- */

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <MissionVision />
        <Locations />
        <WhyKeikol />
        <Industries />
        <Stats />
        <Portfolio />
        <Testimonials />
        <MainCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
