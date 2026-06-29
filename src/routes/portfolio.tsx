import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Eye, MapPin, Palette, Sparkles, Target } from "lucide-react";

import { PageHero, Section, SectionHeader, CTASection } from "@/components";
import { PORTFOLIO_SAMPLES, heroImg } from "@/data/billboards";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Campaign Concepts | Keikol" },
      {
        name: "description",
        content:
          "Explore sample billboard campaign concepts across real estate, FMCG, fashion, telecom, and more from Keikol.",
      },
      { property: "og:title", content: "Portfolio — Keikol" },
      { property: "og:description", content: "Sample outdoor advertising campaign concepts by Keikol." },
      { property: "og:url", content: "/portfolio" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/portfolio" }],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Campaigns that <span className="text-gradient-gold">command attention.</span>
          </>
        }
        subtitle="Explore examples of how brands can use outdoor advertising to increase visibility, launch products, and build credibility in high-traffic locations."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO_SAMPLES.map((c) => (
            <article
              key={c.title}
              className="group flex flex-col overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={c.img}
                  alt={`${c.title} in ${c.location}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Sample Concept
                </span>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                    <MapPin className="h-3 w-3" /> {c.location}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold">{c.title}</h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.campaignType}</span>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                <p className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                  Example campaign direction <ChevronRight className="h-4 w-4" />
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Cards above are illustrative campaign concepts created to demonstrate possible directions, not completed client work.
        </p>
      </Section>

      <Section tone="surface">
        <SectionHeader
          eyebrow="What works"
          title={<>What makes a billboard campaign <span className="text-gradient-gold">effective.</span></>}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Sparkles, title: "Simple Message", body: "The best billboard campaigns communicate quickly and clearly." },
            { icon: Palette, title: "Strong Visual Identity", body: "Bold colors, clear branding, and strong contrast improve recall." },
            { icon: Target, title: "Strategic Location", body: "The right location connects your message with the right audience." },
            { icon: Eye, title: "Consistent Exposure", body: "Repeated visibility builds familiarity, credibility, and trust." },
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

      <CTASection
        headline={<>Create your campaign <span className="text-gradient-gold">with Keikol.</span></>}
        subheadline="Share your campaign goals and we'll recommend placements and creative directions that fit your brand."
      />
    </>
  );
}
