import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Tag } from "lucide-react";

import { ContactForm, ContactSidebar, PageHero, Section, SectionHeader } from "@/components";
import { getBillboardById, heroImg } from "@/data/billboards";

type ContactSearch = { billboard?: string };

const FAQS = [
  {
    q: "How do I choose the right billboard location?",
    a: "Keikol can help you choose based on your city, audience, campaign goal, budget, and preferred visibility level.",
  },
  {
    q: "Do you offer digital and static billboards?",
    a: "Yes. Keikol's roadmap includes both static and digital billboard advertising options depending on location availability.",
  },
  {
    q: "Can I request a custom campaign?",
    a: "Yes. You can share your campaign goals and the Keikol team can recommend suitable billboard options.",
  },
  {
    q: "Can I upload my artwork now?",
    a: "Artwork upload will be added in a future booking system. For now, customers can describe the campaign and submit details through the quote form.",
  },
  {
    q: "Does Keikol already support online payments?",
    a: "Online payments are planned for a later phase. For now, the website should focus on quote requests and customer inquiries.",
  },
];

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    billboard: typeof search.billboard === "string" ? search.billboard : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Request a Quote — Keikol Billboard Advertising" },
      {
        name: "description",
        content:
          "Tell Keikol about your campaign goals, preferred city, budget, and timeline. We'll recommend the right billboard placements.",
      },
      { property: "og:title", content: "Contact Keikol" },
      { property: "og:description", content: "Request a billboard advertising quote in Nigeria." },
      { property: "og:url", content: "/contact" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { billboard: billboardId } = Route.useSearch();
  const billboard = billboardId ? getBillboardById(billboardId) : undefined;
  const interestedLabel = billboard ? `${billboard.city} — ${billboard.area}` : "Not sure yet";

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Request a billboard advertising <span className="text-gradient-gold">quote.</span></>}
        subtitle="Tell us about your campaign goals, preferred city, budget, and timeline. The Keikol team will help you identify the right billboard opportunities."
      />

      <Section>
        {billboard && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-5 shadow-elegant">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-primary-foreground">
                <Tag className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Selected Billboard</p>
                <p className="mt-1 font-display text-base font-bold">{billboard.city} — {billboard.area}</p>
                <p className="text-xs text-muted-foreground">{billboard.billboardType} · {billboard.estimatedDailyImpressions} daily impressions</p>
              </div>
            </div>
            <Link
              to="/locations/$id"
              params={{ id: billboard.id }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs font-semibold hover:border-gold hover:text-gold"
            >
              View billboard details
            </Link>
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <ContactForm interestedBillboard={interestedLabel} billboardId={billboard?.id} />
          <ContactSidebar />
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeader eyebrow="FAQ" title={<>Frequently asked <span className="text-gradient-gold">questions.</span></>} />
        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {FAQS.map((f, i) => <FAQItem key={i} {...f} />)}
        </div>
      </Section>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-display text-base font-bold">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gold transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-border p-5 text-sm leading-relaxed text-muted-foreground">{a}</div>}
    </div>
  );
}
