import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Eye, Globe2, Heart, Lightbulb, Sparkles, TrendingUp, Users } from "lucide-react";

import { PageHero, Section, SectionHeader, CTASection } from "@/components/site/Section";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Keikol — Modern Advertising & Media in Nigeria" },
      {
        name: "description",
        content:
          "Keikol Media Group Ltd is building a modern, transparent, and technology-driven outdoor advertising company in Nigeria.",
      },
      { property: "og:title", content: "About Keikol" },
      { property: "og:description", content: "Building the future of outdoor advertising in Nigeria." },
    ],
  }),
  component: AboutPage,
});

const PHASES = [
  {
    label: "Phase 1",
    title: "Foundation & Brand Establishment",
    items: ["Launch professional website", "Build brand identity", "Secure initial billboard locations", "Acquire first advertising clients"],
  },
  {
    label: "Phase 2",
    title: "Digital Expansion",
    items: ["Add online campaign inquiries", "Build billboard explorer", "Improve customer workflows", "Develop customer-facing tools"],
  },
  {
    label: "Phase 3",
    title: "Smart Advertising Integration",
    items: ["Campaign analytics", "AI-powered recommendations", "Smart scheduling concepts", "Better performance reporting"],
  },
  {
    label: "Phase 4",
    title: "Advanced Media Infrastructure",
    items: ["Nationwide billboard network", "Enterprise advertising solutions", "Advanced analytics systems", "Smart infrastructure management"],
  },
  {
    label: "Phase 5",
    title: "Long-Term Technology Vision",
    items: ["Drone inspections", "Robotic maintenance", "Predictive maintenance", "AI-driven infrastructure optimization"],
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Keikol"
        title={<>Building the future of outdoor advertising in <span className="text-gradient-gold">Nigeria.</span></>}
        subtitle="Keikol is a modern advertising and media brand created to make billboard advertising more accessible, transparent, and technology-driven."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <SectionHeader
              align="left"
              eyebrow="Company Overview"
              title={<>A modern advertising and media company.</>}
            />
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Keikol is the public-facing brand of <strong className="text-foreground">Keikol Media Group Ltd</strong>,
                a modern advertising and media company focused on outdoor advertising, billboard placements,
                digital media solutions, and future technology-driven campaign management.
              </p>
              <p>
                The company is starting with billboard advertising and gradually building toward a smarter media
                infrastructure platform that combines premium outdoor visibility with digital experiences,
                analytics, automation, and AI-powered advertising tools.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline">
            <Lightbulb className="h-8 w-8 text-gold" />
            <h3 className="mt-4 font-display text-xl font-bold">Making advertising easier, clearer, and more effective</h3>
            <p className="mt-3 text-sm text-muted-foreground">Many businesses struggle with:</p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Reaching large audiences effectively",
                "Finding premium advertising spaces",
                "Understanding campaign options",
                "Measuring advertising value",
                "Accessing transparent advertising information",
                "Managing campaigns through modern systems",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {p}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              Keikol is being built to solve these challenges with premium placements, better user
              experience, transparent communication, and a technology-focused approach.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeader
          eyebrow="Our Approach"
          title={<>How we work with <span className="text-gradient-gold">brands.</span></>}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Eye, title: "Premium Media Placement", body: "We focus on high-visibility billboard locations that help brands get noticed." },
            { icon: Users, title: "Better Customer Experience", body: "A smoother, clearer, and more professional advertising journey." },
            { icon: Sparkles, title: "Transparent Communication", body: "We want businesses to understand their options, campaign value, and next steps." },
            { icon: TrendingUp, title: "Future Technology Integration", body: "Our long-term roadmap includes digital booking, analytics, AI, automation, and smart infrastructure." },
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

      {/* Timeline */}
      <Section>
        <SectionHeader
          eyebrow="Roadmap"
          title={<>Our long-term <span className="text-gradient-electric">vision timeline.</span></>}
          subtitle="The roadmap below outlines Keikol's future direction. These are forward-looking phases, not completed features."
        />
        <div className="relative mt-14">
          <div className="absolute left-4 top-0 bottom-0 hidden w-px bg-border lg:left-1/2 lg:block" />
          <div className="space-y-8">
            {PHASES.map((p, i) => (
              <div key={p.label} className={`relative lg:grid lg:grid-cols-2 lg:gap-12 ${i % 2 === 1 ? "lg:[&>*:first-child]:col-start-2" : ""}`}>
                <div className="rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">{p.label}</span>
                  <h3 className="mt-2 font-display text-xl font-bold">{p.title}</h3>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section tone="surface">
        <SectionHeader eyebrow="Values" title={<>What we <span className="text-gradient-gold">stand for.</span></>} />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Eye, label: "Visibility" },
            { icon: Heart, label: "Trust" },
            { icon: Lightbulb, label: "Innovation" },
            { icon: CheckCircle2, label: "Transparency" },
            { icon: Users, label: "Customer Experience" },
            { icon: TrendingUp, label: "Growth" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl bg-card-premium p-5 shadow-elegant ring-hairline">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Partner with Keikol <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      <CTASection />
    </>
  );
}

// silence unused
void Globe2;
