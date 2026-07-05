import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronRight,
  MapPin,
  Sparkles,
} from "lucide-react";

import { Section, SectionHeader, CTASection } from "@/components";
import { BillboardCard } from "@/components/BillboardCard";
import { PORTFOLIO_SAMPLES, heroImg } from "@/data/billboards";
import { useBillboards } from "@/lib/billboards-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Keikol — A Modern Media Company" },
      {
        name: "description",
        content:
          "Keikol is a modern media company — premium billboard placements and a curated photography & videography network, built for ambitious brands.",
      },
      { property: "og:title", content: "Keikol — A Modern Media Company" },
      {
        property: "og:description",
        content:
          "Premium billboard placements and a curated photography & videography network, built for ambitious brands.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <FeaturedLocations />
      <Proof />
      <PortfolioPreview />
      <CTASection
        headline={
          <>
            Ready to build a campaign worth{" "}
            <span className="text-gradient-gold">looking twice at?</span>
          </>
        }
        subheadline="Tell us about your brand and the outcome you want, and we'll shape the right mix of billboards, photography, and video around it."
      />
    </>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero pt-32 lg:pt-40">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Keikol media — outdoor and visual production"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="mx-auto max-w-4xl px-5 pb-28 text-center lg:px-8 lg:pb-40">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          A modern media company
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          Media that makes brands{" "}
          <span className="text-gradient-gold">impossible to ignore.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Keikol is a modern media company helping ambitious brands get seen.
          Explore the service you came for, or let us shape the right mix for
          your campaign.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="#services"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Explore our services <ArrowRight className="h-4 w-4" />
          </a>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent hover:text-accent"
          >
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Services (scalable catalog) ---------------- */

type Service = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  icon: typeof MapPin;
  status: "Live" | "Onboarding" | "Coming Soon";
  highlights: string[];
};

const SERVICES: Service[] = [
  {
    eyebrow: "Outdoor Advertising",
    title: "Billboards & Out-of-Home",
    description:
      "Premium billboard placements across Nigeria's highest-traffic corridors — booked with transparent pricing and full campaign support.",
    href: "/locations",
    icon: MapPin,
    status: "Live",
    highlights: ["Premium locations", "Transparent pricing", "Campaign support"],
  },
  {
    eyebrow: "Visual Production",
    title: "Photography & Videography",
    description:
      "A curated directory of vetted photographers and videographers — matched to your brand, budget, and shoot type.",
    href: "/photographers",
    icon: Camera,
    status: "Onboarding",
    highlights: ["Vetted creators", "Brand-matched", "Nationwide"],
  },
  // Add a new service here — the layout scales automatically.
];

function Services() {
  return (
    <Section id="services">
      <SectionHeader
        eyebrow="Our Services"
        title={
          <>
            Choose the service you{" "}
            <span className="text-gradient-gold">came here for.</span>
          </>
        }
        subtitle="Every service lives on its own page — with real inventory, pricing, and people behind it. More services are on the way."
      />

      <div
        className={`mt-14 grid gap-6 ${
          SERVICES.length === 1
            ? "max-w-2xl mx-auto"
            : SERVICES.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {SERVICES.map((s) => (
          <ServiceCard key={s.title} service={s} />
        ))}
      </div>
    </Section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  const isLive = service.status === "Live";
  return (
    <Link
      to={service.href}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card-premium p-8 shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow sm:p-10"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/15 blur-3xl transition-opacity duration-500 group-hover:bg-gold/25" />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-primary-foreground shadow-gold">
            <Icon className="h-5 w-5" />
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
              isLive
                ? "bg-accent/15 text-accent"
                : "bg-surface-2 text-muted-foreground"
            }`}
          >
            {isLive && (
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
            )}
            {service.status}
          </span>
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {service.eyebrow}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          {service.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {service.description}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {service.highlights.map((h) => (
            <li
              key={h}
              className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground"
            >
              {h}
            </li>
          ))}
        </ul>

        <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold">
          Explore {service.title.split(" ")[0]}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

/* ---------------- Featured Locations (live billboard data) ---------------- */

function FeaturedLocations() {
  const { data: billboards } = useBillboards();
  const featured = (billboards ?? []).slice(0, 4);
  if (featured.length === 0) return null;
  return (
    <Section tone="surface">
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
        {featured.map((b) => (
          <BillboardCard key={b.id} b={b} compact />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          to="/locations"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          View All Locations <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

/* ---------------- Proof (one confident section) ---------------- */

const INDUSTRY_TAGS = [
  "Real Estate",
  "Banking & Finance",
  "Telecom",
  "FMCG",
  "Fashion",
  "Restaurants",
  "Education",
  "Events",
  "Politics",
  "Technology",
];

function Proof() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.25 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <Section>
      <div
        ref={ref}
        className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          Why brands choose Keikol
        </p>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          One modern partner for every{" "}
          <span className="text-gradient-gold">format your brand needs.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We're building the media infrastructure ambitious African brands
          deserve — transparent, technology-driven, and premium end to end.
          One team behind the placement, the shoot, and the campaign.
        </p>

        <div className="mt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted across industries
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {INDUSTRY_TAGS.map((t) => (
              <li key={t}>
                <Link
                  to="/industries"
                  className="block rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-gold/50 hover:text-gold"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- Portfolio Preview ---------------- */

function PortfolioPreview() {
  const items = PORTFOLIO_SAMPLES.slice(0, 3);
  return (
    <Section tone="surface">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Selected Work
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Campaigns that{" "}
            <span className="text-gradient-gold">command attention.</span>
          </h2>
        </div>
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold sm:self-auto"
        >
          View full portfolio <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {items.map((c) => (
          <article
            key={c.title}
            className="group overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-[5/4] overflow-hidden">
              <img
                src={c.img}
                alt={`${c.title} in ${c.location}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  {c.location}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold">
                  {c.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center justify-between p-5">
              <p className="text-sm text-muted-foreground">{c.campaignType}</p>
              <ChevronRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
