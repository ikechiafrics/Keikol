import { createFileRoute } from "@tanstack/react-router";
import { Bot, Ghost, Music2, Search, Users } from "lucide-react";

import { PageHero, Section, SectionHeader } from "@/components";
import {
  DigitalMarketingInquiryForm,
  PLATFORM_OPTIONS,
} from "@/components/DigitalMarketingInquiryForm";

export const Route = createFileRoute("/digital-marketing")({
  head: () => ({
    meta: [
      { title: "Digital Marketing — Client Acquisition — Keikol" },
      {
        name: "description",
        content:
          "Client acquisition campaigns across Meta, Google, Snapchat, TikTok, and AI search — request a quote from Keikol.",
      },
    ],
  }),
  component: DigitalMarketingPage,
});

// Icon + description per platform, keyed by the same labels PLATFORM_OPTIONS
// declares — so the grid below and the inquiry form's multi-select can never
// drift out of sync on which platforms are actually offered.
const PLATFORM_DETAILS: Record<string, { icon: typeof Users; blurb: string }> = {
  Meta: { icon: Users, blurb: "Facebook & Instagram campaigns built around your audience." },
  Google: { icon: Search, blurb: "Search and display ads that show up when it matters." },
  Snapchat: { icon: Ghost, blurb: "Reach younger, high-engagement audiences natively." },
  TikTok: { icon: Music2, blurb: "Short-form creative that performs where attention lives." },
  "AI Search (ChatGPT)": {
    icon: Bot,
    blurb: "Visibility in AI-powered answers, not just search results.",
  },
};

function DigitalMarketingPage() {
  return (
    <>
      <PageHero
        eyebrow="Digital Marketing"
        title={
          <>
            Client acquisition that{" "}
            <span className="text-gradient-gold">meets people where they are.</span>
          </>
        }
        subtitle="Paid campaigns across the platforms your customers actually use — built, run, and measured by Keikol."
      />

      <Section>
        <SectionHeader
          eyebrow="Where We Run Campaigns"
          title={
            <>
              Platforms we <span className="text-gradient-gold">work with.</span>
            </>
          }
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_OPTIONS.map((label) => {
            const { icon: Icon, blurb } = PLATFORM_DETAILS[label];
            return (
              <div
                key={label}
                className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-electric text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
              </div>
            );
          })}
        </div>
      </Section>

      <Section tone="surface" id="request-quote">
        <SectionHeader
          align="left"
          eyebrow="Get In Touch"
          title={
            <>
              Request a <span className="text-gradient-gold">quote.</span>
            </>
          }
          subtitle="Tell us which platforms you're interested in and the Keikol team will put together a plan."
        />
        <div className="mt-10 max-w-2xl">
          <DigitalMarketingInquiryForm />
        </div>
      </Section>
    </>
  );
}
