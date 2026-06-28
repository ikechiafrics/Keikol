import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Filter, MapPin, Search, Target, Clock, Users, Compass } from "lucide-react";

import { PageHero, Section, SectionHeader, CTASection } from "@/components/site/Section";
import { BillboardCard } from "@/components/site/BillboardCard";
import {
  BILLBOARDS,
  CITIES,
  BILLBOARD_TYPES,
  AVAILABILITIES,
  INDUSTRY_FILTERS,
  heroImg,
} from "@/lib/site-data";

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "Billboard Locations — Keikol" },
      {
        name: "description",
        content:
          "Explore premium billboard advertising locations across Lagos, Abuja, Port Harcourt, and Kano with Keikol.",
      },
      { property: "og:title", content: "Billboard Locations — Keikol" },
      {
        property: "og:description",
        content: "High-visibility billboard advertising spaces across major Nigerian cities.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<(typeof CITIES)[number]>("All");
  const [type, setType] = useState<(typeof BILLBOARD_TYPES)[number]>("All");
  const [avail, setAvail] = useState<(typeof AVAILABILITIES)[number]>("All");
  const [industry, setIndustry] = useState<(typeof INDUSTRY_FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    return BILLBOARDS.filter((b) => {
      if (city !== "All" && b.city !== city) return false;
      if (type !== "All" && b.billboardType !== type) return false;
      if (avail !== "All" && b.availability !== avail) return false;
      if (
        industry !== "All" &&
        !b.recommendedIndustries.some((i) => i.toLowerCase().includes(industry.toLowerCase()))
      )
        return false;
      if (q) {
        const t = q.toLowerCase();
        if (
          !b.city.toLowerCase().includes(t) &&
          !b.area.toLowerCase().includes(t) &&
          !b.landmark.toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    });
  }, [q, city, type, avail, industry]);

  return (
    <>
      <PageHero
        eyebrow="Billboard Locations"
        title={<>Explore <span className="text-gradient-gold">Premium Billboard Locations</span></>}
        subtitle="Discover high-visibility advertising spaces across major Nigerian cities, designed to help your brand reach the right audience."
        image={heroImg}
      />

      <Section>
        {/* Filters */}
        <div className="rounded-3xl bg-card-premium p-5 shadow-elegant ring-hairline sm:p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4 text-gold" />
            Filter locations
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_repeat(4,_1fr)]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search city, area, or landmark"
                className="w-full rounded-xl border border-border bg-background/60 py-3 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </label>
            <Select value={city} onChange={(v) => setCity(v as typeof city)} options={CITIES} label="City" />
            <Select value={type} onChange={(v) => setType(v as typeof type)} options={BILLBOARD_TYPES} label="Type" />
            <Select value={avail} onChange={(v) => setAvail(v as typeof avail)} options={AVAILABILITIES} label="Availability" />
            <Select value={industry} onChange={(v) => setIndustry(v as typeof industry)} options={INDUSTRY_FILTERS} label="Industry" />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{filtered.length} location{filtered.length === 1 ? "" : "s"} found</span>
            {(q || city !== "All" || type !== "All" || avail !== "All" || industry !== "All") && (
              <button
                onClick={() => { setQ(""); setCity("All"); setType("All"); setAvail("All"); setIndustry("All"); }}
                className="font-semibold text-gold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => <BillboardCard key={b.id} b={b} />)}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-10 text-center">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-display text-lg font-bold">No locations match your filters</p>
            <p className="mt-2 text-sm text-muted-foreground">Try clearing the filters or contact us for a tailored recommendation.</p>
            <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
              Request a Recommendation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </Section>

      {/* Map placeholder */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Coming Soon"
          title={<>Interactive Billboard <span className="text-gradient-electric">Map Coming Soon</span></>}
          subtitle="Keikol is building an interactive map experience that will allow customers to explore billboard inventory by city, traffic area, availability, price range, and campaign goals."
        />
        <div className="mt-12 relative overflow-hidden rounded-3xl bg-card-premium p-8 shadow-elegant ring-hairline">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_oklch(0.84_0.14_88_/_0.4)_0%,_transparent_30%),radial-gradient(circle_at_60%_55%,_oklch(0.68_0.18_250_/_0.35)_0%,_transparent_25%),radial-gradient(circle_at_45%_65%,_oklch(0.68_0.18_250_/_0.25)_0%,_transparent_20%)]" />
          </div>
          <div className="relative grid min-h-[320px] place-items-center">
            <div className="text-center">
              <Compass className="mx-auto h-10 w-10 text-gold" />
              <p className="mt-4 font-display text-xl font-bold">Nigeria · Billboard Network Preview</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Pins represent current and upcoming Keikol billboard locations across Lagos, Abuja, Port Harcourt, and Kano.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {CITIES.filter((c) => c !== "All").map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How to choose */}
      <Section>
        <SectionHeader
          eyebrow="Guidance"
          title={<>How to choose the <span className="text-gradient-gold">right billboard.</span></>}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Audience Fit", body: "Choose locations where your target customers live, work, or commute." },
            { icon: Target, title: "Traffic Volume", body: "High-traffic roads can improve daily visibility and campaign reach." },
            { icon: Compass, title: "Campaign Objective", body: "Brand awareness, product launch, event promotion, and retail campaigns may require different placements." },
            { icon: Clock, title: "Duration & Timing", body: "Longer campaigns can improve brand recall and customer familiarity." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-electric text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        headline={<>Need help choosing the <span className="text-gradient-gold">right location?</span></>}
        subheadline="Tell us about your campaign goals and the Keikol team will recommend the best billboard placements for your brand."
      />
    </>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  label: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-background/60 px-3 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {label}: {o}
          </option>
        ))}
      </select>
    </label>
  );
}
