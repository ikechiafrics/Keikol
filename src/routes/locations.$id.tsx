import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  Landmark,
  Lightbulb,
  MapPin,
  Megaphone,
  Phone,
  Ruler,
  Sparkles,
  Sun,
  Tag,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  BillboardCard,
  Breadcrumb,
  CTASection,
  Section,
  SectionHeader,
  TagList,
} from "@/components";
import { BILLBOARDS, getBillboardById, type Billboard } from "@/data/billboards";

export const Route = createFileRoute("/locations/$id")({
  head: ({ params }) => {
    const b = getBillboardById(params.id);
    const title = b ? `${b.area}, ${b.city} — Keikol` : "Billboard — Keikol";
    const desc = b
      ? `${b.billboardType} · ${b.estimatedDailyImpressions} daily impressions · ${b.landmark}.`
      : "Billboard details.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(b ? [{ property: "og:image", content: b.image }] : []),
      ],
    };
  },
  component: BillboardDetailPage,
});

function BillboardDetailPage() {
  const { id } = Route.useParams();
  const b = getBillboardById(id);

  if (!b) return <NotFoundState id={id} />;

  const related = BILLBOARDS.filter((x) => x.id !== b.id).slice(0, 3);
  const quoteHref = `/contact?billboard=${b.id}`;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-hero pt-32 pb-16 lg:pt-40">
        <div className="absolute inset-0 -z-10">
          <img src={b.image} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", to: "/" },
              { label: "Locations", to: "/locations" },
              { label: `${b.city} — ${b.area}` },
            ]}
          />


          <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{b.city}</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{b.area}</h1>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {b.landmark}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold border border-border">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {b.availability}
                </span>
                <span className="text-sm text-muted-foreground">{b.billboardType}</span>
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <Eye className="h-4 w-4 text-accent" />
                  <strong>{b.estimatedDailyImpressions}</strong>
                  <span className="text-muted-foreground">daily impressions</span>
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  search={{ billboard: b.id }}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  Request Quote <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/locations"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Locations
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl bg-card-premium p-1 shadow-elegant ring-hairline">
                <img src={b.image} alt={b.area} className="aspect-[4/3] w-full rounded-[1.35rem] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key details grid */}
      <Section>
        <SectionHeader
          align="left"
          eyebrow="Key Details"
          title={<>Everything you need to know about <span className="text-gradient-gold">this placement.</span></>}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailInfoCard icon={MapPin} label="City" value={b.city} />
          <DetailInfoCard icon={Building2} label="Area" value={b.area} />
          <DetailInfoCard icon={Landmark} label="Landmark" value={b.landmark} />
          <DetailInfoCard icon={Megaphone} label="Billboard Type" value={b.billboardType} />
          <DetailInfoCard icon={Ruler} label="Size" value={b.size} />
          <DetailInfoCard icon={Eye} label="Daily Impressions" value={b.estimatedDailyImpressions} />
          <DetailInfoCard icon={CheckCircle2} label="Availability" value={b.availability} />
          <DetailInfoCard icon={Wallet} label="Price Range" value={b.priceRange} />
          <DetailInfoCard icon={Sun} label="Lighting" value={b.lighting} />
        </div>
      </Section>

      {/* Description */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeader
            align="left"
            eyebrow="About this placement"
            title={<>Why brands choose <span className="text-gradient-gold">{b.area}.</span></>}
          />
          <div className="rounded-3xl bg-card-premium p-8 shadow-elegant ring-hairline">
            <p className="text-base leading-relaxed text-muted-foreground">{b.description}</p>
            <TagList items={b.tags} className="mt-6" />

          </div>
        </div>
      </Section>

      {/* Industries + bestFor + nearby */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <TagPanel
            title="Recommended Industries"
            icon={Tag}
            items={b.recommendedIndustries}
            accent="gold"
          />
          <TagPanel
            title="Best For"
            icon={Target}
            items={b.bestFor}
            accent="electric"
          />
          <TagPanel
            title="Nearby Environment"
            icon={Landmark}
            items={b.nearbyLandmarks}
            accent="gold"
          />
        </div>
      </Section>

      {/* Why this works */}
      <Section tone="surface">
        <SectionHeader eyebrow="Why it works" title={<>Why this location <span className="text-gradient-gold">delivers.</span></>} />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {[
            { icon: Eye, title: "High Daily Visibility", body: "This placement is designed to reach commuters, shoppers, professionals, and local traffic." },
            { icon: TrendingUp, title: "Strong Brand Recall", body: "Repeated exposure helps customers remember your brand over time." },
            { icon: Target, title: "Strategic Positioning", body: "The area is suitable for businesses that want credibility, awareness, and market presence." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Creative tips */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-gold" /> Creative Guidance
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Creative tips for <span className="text-gradient-gold">this billboard.</span>
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              A great billboard is read in seconds. Use these guidelines to design artwork that
              performs at <Ruler className="inline h-4 w-4" /> {b.size}.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Use a short headline with 7 words or fewer",
              "Make your logo clearly visible",
              "Use strong contrast between text and background",
              "Include one clear call to action",
              "Avoid too much text or detail",
              "Design for quick readability from a distance",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-3 rounded-2xl bg-card-premium p-4 shadow-elegant ring-hairline">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Related */}
      <Section tone="surface">
        <SectionHeader eyebrow="More Locations" title={<>You may also <span className="text-gradient-electric">consider these.</span></>} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => <BillboardCard key={r.id} b={r} compact />)}
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-card-premium p-10 shadow-elegant ring-hairline sm:p-14">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <Phone className="mx-auto h-10 w-10 text-gold" />
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Interested in <span className="text-gradient-gold">this billboard location?</span>
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Send us your campaign details and the Keikol team will help you confirm availability, pricing, and next steps.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                search={{ billboard: b.id }}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
              >
                Request Quote <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/locations"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Locations
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

function DetailInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-card-premium p-5 shadow-elegant ring-hairline">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function TagPanel({
  title,
  icon: Icon,
  items,
  accent,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  accent: "gold" | "electric";
}) {
  const accentClass = accent === "gold" ? "bg-gold text-primary-foreground" : "bg-electric text-accent-foreground";
  return (
    <div className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display text-base font-bold">{title}</h3>
      </div>
      <TagList items={items} className="mt-5" />

    </div>
  );
}

function NotFoundState({ id }: { id: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-40 pb-24 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Not Found
      </span>
      <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        Billboard Location <span className="text-gradient-gold">Not Found</span>
      </h1>
      <p className="mt-4 text-base text-muted-foreground">
        The billboard location you are looking for {id ? <>(<code className="text-foreground">{id}</code>)</> : null} may have been moved, renamed, or is no longer available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/locations" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent">
          <ArrowLeft className="h-4 w-4" /> Back to Locations
        </Link>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold">
          Request a Quote <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export type { Billboard };
