import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Eye, Lightbulb, MapPin, Phone, Ruler, Sparkles, Tag, Target, TrendingUp } from "lucide-react";

import { Section, SectionHeader, CTASection } from "@/components/site/Section";
import { BillboardCard } from "@/components/site/BillboardCard";
import { BILLBOARDS } from "@/lib/site-data";

export const Route = createFileRoute("/locations/$id")({
  head: ({ params }) => {
    const b = BILLBOARDS.find((x) => x.id === params.id);
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
  loader: ({ params }) => {
    const b = BILLBOARDS.find((x) => x.id === params.id);
    if (!b) throw notFound();
    return { billboard: b };
  },
  component: BillboardDetailPage,
  notFoundComponent: () => (
    <div className="pt-40 pb-24 text-center">
      <h1 className="font-display text-3xl font-bold">Billboard not found</h1>
      <p className="mt-3 text-muted-foreground">This location may have moved or been removed.</p>
      <Link to="/locations" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold">
        Back to Locations <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  ),
});

function BillboardDetailPage() {
  const { billboard: b } = Route.useLoaderData();
  const related = BILLBOARDS.filter((x) => x.id !== b.id).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-hero pt-32 pb-16 lg:pt-40">
        <div className="absolute inset-0 -z-10">
          <img src={b.image} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Link to="/locations" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-gold">
            ← All Locations
          </Link>
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
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5">
                  Request Quote for This Billboard <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent">
                  <Phone className="h-4 w-4" /> Contact Sales
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

      {/* Details grid */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl bg-card-premium p-8 shadow-elegant ring-hairline">
            <h2 className="font-display text-2xl font-bold">Location Details</h2>
            <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ["Location", `${b.area}, ${b.city}`],
                ["Landmark", b.landmark],
                ["Billboard Type", b.billboardType],
                ["Size", b.size],
                ["Daily Impressions", b.estimatedDailyImpressions],
                ["Availability", b.availability],
                ["Lighting", b.lighting],
                ["Price Range", b.priceRange],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-display text-lg font-bold">About this placement</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                This billboard location is designed for brands that want strong visibility in a high-traffic
                commercial environment. It is suitable for awareness campaigns, product launches, retail
                promotions, and premium brand positioning.
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
              <h3 className="font-display text-base font-bold">Recommended Industries</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {b.recommendedIndustries.map((i: string) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold border border-border">
                    <Tag className="h-3 w-3 text-gold" /> {i}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
              <h3 className="font-display text-base font-bold">Nearby Businesses</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {b.nearbyBusinesses.map((n: string) => (
                  <li key={n} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {n}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Section>

      {/* Why it works */}
      <Section tone="surface">
        <SectionHeader eyebrow="Why this works" title={<>Why this location <span className="text-gradient-gold">delivers.</span></>} />
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

      <CTASection
        headline={<>Interested in this <span className="text-gradient-gold">billboard location?</span></>}
        subheadline="Send us your campaign details and the Keikol team will help you confirm availability, pricing, and next steps."
      />
    </>
  );
}
