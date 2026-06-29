import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Eye,
  Globe2,
  Headphones,
  MapPin,
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
} from "lucide-react";

import { Section, SectionHeader, CTASection } from "@/components";
import { BillboardCard } from "@/components/BillboardCard";
import { BILLBOARDS, PORTFOLIO_SAMPLES, heroImg } from "@/data/billboards";

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
      { property: "og:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <MissionVision />
      <FeaturedLocations />
      <WhyKeikol />
      <IndustriesPreview />
      <Stats />
      <PortfolioPreview />
      <Testimonials />
      <CTASection />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-hero pt-32 lg:pt-40">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Premium digital billboard glowing over a Lagos highway at night"
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
            Keikol helps businesses grow through premium outdoor advertising, strategic billboard
            placements, and technology-driven media solutions across Nigeria.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/locations"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Explore Billboard Locations <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-accent hover:text-accent"
            >
              Request a Quote
            </Link>
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

        <div className="relative hidden lg:block">
          <div className="animate-float-slow relative ml-auto w-full max-w-md overflow-hidden rounded-3xl bg-card-premium p-1 shadow-elegant ring-hairline">
            <div className="overflow-hidden rounded-[1.35rem]">
              <img
                src={heroImg}
                alt="Featured Keikol billboard placement"
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
            <p className="mt-1 font-display text-2xl font-extrabold text-gradient-gold">120,000+</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionVision() {
  return (
    <Section>
      <div className="grid gap-6 lg:grid-cols-2">
        {[
          {
            tag: "Our Mission",
            icon: Zap,
            title: "Make outdoor advertising effortless.",
            body:
              "To make outdoor advertising more accessible, transparent, and effective for businesses through premium billboard placements and seamless digital experiences.",
            accent: "gold" as const,
          },
          {
            tag: "Our Vision",
            icon: Globe2,
            title: "Africa's smart media infrastructure.",
            body:
              "To become one of Africa's leading technology-enabled advertising and media infrastructure companies — combining outdoor media, digital platforms, AI, automation, and smart advertising systems.",
            accent: "electric" as const,
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
                  accent === "gold"
                    ? "bg-gold text-primary-foreground"
                    : "bg-electric text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {tag}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{title}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function FeaturedLocations() {
  const featured = BILLBOARDS.slice(0, 4);
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

const WHY = [
  { icon: Eye, title: "Premium Visibility", body: "High-impact billboard locations designed to place your brand in front of large audiences." },
  { icon: CheckCircle2, title: "Transparent Advertising", body: "Clear information, straightforward communication, and a more modern advertising experience." },
  { icon: Cpu, title: "Technology-Driven Approach", body: "Built with a long-term vision for online booking, analytics, automation, and AI-powered campaign tools." },
  { icon: Headphones, title: "Customer-Focused Experience", body: "A smoother process from inquiry to campaign launch, with support at every step." },
  { icon: Globe2, title: "Scalable Media Network", body: "Starting with billboard advertising and growing into a nationwide smart media infrastructure platform." },
  { icon: Sparkles, title: "Modern Brand Presentation", body: "Professional advertising solutions for businesses that want to look credible, visible, and competitive." },
];

function WhyKeikol() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Why Keikol"
        title={<>Why brands choose <span className="text-gradient-gold">Keikol.</span></>}
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

const INDUSTRY_ICONS = [
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

function IndustriesPreview() {
  return (
    <Section tone="surface">
      <SectionHeader
        eyebrow="Industries We Serve"
        title={<>Industries we <span className="text-gradient-electric">help grow.</span></>}
        subtitle="From real estate launches to telecom campaigns — Keikol delivers visibility where it matters."
      />
      <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {INDUSTRY_ICONS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card-premium p-5 text-center shadow-elegant transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-gold transition-colors group-hover:bg-gold group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          to="/industries"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          View Industries <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

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
      <p className="font-display text-4xl font-extrabold text-gradient-gold sm:text-5xl">{value}</p>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Stats() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Impact"
        title={<>Built to deliver <span className="text-gradient-gold">measurable reach.</span></>}
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Statistics are early estimates and may be updated as Keikol expands its billboard network.
      </p>
    </Section>
  );
}

function PortfolioPreview() {
  const items = PORTFOLIO_SAMPLES.slice(0, 3);
  return (
    <Section tone="surface">
      <SectionHeader
        eyebrow="Portfolio"
        title={<>Campaigns that <span className="text-gradient-gold">command attention.</span></>}
        subtitle="A glimpse of the kind of high-impact outdoor work Keikol delivers for ambitious brands."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {items.map((c) => (
          <article
            key={c.title}
            className="group overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-[5/4] overflow-hidden">
              <img src={c.img} alt={`${c.title} in ${c.location}`} loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{c.location}</p>
                <h3 className="mt-1 font-display text-lg font-bold">{c.title}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between p-5">
              <p className="text-sm text-muted-foreground">{c.campaignType}</p>
              <ChevronRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          View Portfolio <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}

const TESTIMONIALS = [
  { quote: "Keikol gives brands a modern way to access premium billboard advertising with clarity and confidence.", name: "Marketing Director", role: "Real Estate Brand" },
  { quote: "The experience feels professional, modern, and built for brands that care about visibility.", name: "Founder", role: "Restaurant Group" },
  { quote: "Keikol's approach to outdoor media feels more transparent and technology-forward than traditional advertising options.", name: "Brand Manager", role: "FMCG Company" },
];

function Testimonials() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Trusted Words"
        title={<>What partners say about <span className="text-gradient-electric">working with Keikol.</span></>}
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name + t.role} className="relative flex flex-col rounded-2xl bg-card-premium p-7 shadow-elegant ring-hairline">
            <Quote className="h-7 w-7 text-gold/70" />
            <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground/90">"{t.quote}"</blockquote>
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
