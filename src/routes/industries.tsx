import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
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
  CheckCircle2,
} from "lucide-react";

import { PageHero, Section, CTASection } from "@/components";
import { heroImg } from "@/data/billboards";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries — Outdoor Advertising for Every Sector | Keikol" },
      {
        name: "description",
        content:
          "From real estate to telecom, fashion, and education — see how Keikol billboard advertising fits every industry.",
      },
      { property: "og:title", content: "Industries — Keikol" },
      { property: "og:description", content: "Outdoor advertising solutions tailored to every industry in Nigeria." },
      { property: "og:url", content: "/industries" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
  component: IndustriesPage,
});

const INDUSTRIES = [
  {
    icon: Building2,
    name: "Real Estate",
    copy: "Promote estates, apartments, commercial properties, open houses, and investment opportunities with premium billboard visibility in high-growth areas.",
    campaigns: ["Estate launch", "Property sales", "Open house promotion", "Luxury development awareness"],
  },
  {
    icon: Landmark,
    name: "Banking & Finance",
    copy: "Build trust, awareness, and public confidence for financial products, banking services, fintech platforms, and investment campaigns.",
    campaigns: ["Brand awareness", "New branch launch", "Product campaign", "Public trust campaign"],
  },
  {
    icon: Radio,
    name: "Telecom",
    copy: "Reach mass audiences with high-frequency visibility for data plans, network campaigns, device offers, and brand awareness.",
    campaigns: ["Product launch", "Network coverage campaign", "Promotional offer", "Brand dominance campaign"],
  },
  {
    icon: Utensils,
    name: "Restaurants",
    copy: "Drive local traffic, promote new branches, launch menu offers, and keep your food brand top-of-mind with nearby customers.",
    campaigns: ["New branch launch", "Menu promotion", "Seasonal offer", "Local awareness campaign"],
  },
  {
    icon: ShoppingBag,
    name: "FMCG",
    copy: "Support consumer product visibility across busy roads, shopping districts, and commercial corridors where buying decisions are influenced daily.",
    campaigns: ["Product launch", "Brand awareness", "Retail support", "Seasonal campaign"],
  },
  {
    icon: Shirt,
    name: "Fashion",
    copy: "Create aspirational visibility for fashion brands, boutiques, lifestyle campaigns, product drops, and premium collections.",
    campaigns: ["Collection launch", "Store opening", "Brand awareness", "Event promotion"],
  },
  {
    icon: GraduationCap,
    name: "Education",
    copy: "Promote schools, universities, training programs, admissions, and education campaigns to families, students, and professionals.",
    campaigns: ["Admissions campaign", "Program launch", "Campus awareness", "Training promotion"],
  },
  {
    icon: PartyPopper,
    name: "Events",
    copy: "Increase attendance and awareness for concerts, conferences, exhibitions, religious events, festivals, and major public gatherings.",
    campaigns: ["Event awareness", "Ticket sales", "Sponsor visibility", "Countdown campaign"],
  },
  {
    icon: Vote,
    name: "Politics / Public Campaigns",
    copy: "Support campaign visibility, public awareness, civic education, and message recall through strategic billboard placements.",
    campaigns: ["Public awareness", "Candidate visibility", "Community message", "Policy campaign"],
  },
  {
    icon: Cpu,
    name: "Technology",
    copy: "Help technology companies, SaaS platforms, apps, fintech brands, and digital services build offline trust and mainstream awareness.",
    campaigns: ["App launch", "Product awareness", "Brand credibility", "Market expansion"],
  },
];

function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title={
          <>
            Outdoor advertising solutions for{" "}
            <span className="text-gradient-gold">every industry.</span>
          </>
        }
        subtitle="From real estate launches to restaurant promotions, Keikol helps brands use billboard advertising to build visibility, trust, and customer demand."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {INDUSTRIES.map(({ icon: Icon, name, copy, campaigns }) => (
            <article
              key={name}
              className="group relative overflow-hidden rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/10 blur-3xl transition-opacity group-hover:bg-gold/20" />
              <div className="relative flex items-start gap-5">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-electric text-accent-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold">{name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Best campaign types
                  </p>
                  <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {campaigns.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-card-premium p-10 text-center shadow-elegant ring-hairline">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Not sure which billboard fits your industry?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Share your goals and our team will recommend the best placements for your sector.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Request a Campaign Recommendation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-gold hover:text-gold"
            >
              See Example Campaign Directions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      <CTASection />
    </>
  );
}
