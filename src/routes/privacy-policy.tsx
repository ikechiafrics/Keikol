import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Keikol" },
      {
        name: "description",
        content:
          "Read how Keikol collects and uses information to respond to billboard advertising inquiries and improve services.",
      },
      { property: "og:title", content: "Privacy Policy — Keikol" },
      {
        property: "og:description",
        content:
          "How Keikol handles your information when you request a quote or browse our website.",
      },
      { property: "og:url", content: "/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={<>Privacy <span className="text-gradient-gold">Policy</span></>}
        subtitle="Last updated: June 2026"
      />

      <Section className="prose prose-invert max-w-none">
        <div className="mx-auto max-w-3xl">
          <p className="text-muted-foreground">
            Keikol (the public brand of <strong className="text-foreground">Keikol Media Ltd</strong>) is committed to respecting your privacy.
            This Privacy Policy explains what information we collect through the Keikol website and how we use it.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">1. Information we collect</h2>
          <p className="text-muted-foreground">
            When you use our website, request a quote, or contact us, we may collect the following information:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Name</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Company name</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Email address</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Phone number</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Campaign details and goals</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> City of interest</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Budget range</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Form submission information</li>
          </ul>

          <h2 className="mt-10 font-display text-2xl font-bold">2. How we use your information</h2>
          <p className="text-muted-foreground">
            We use the information you provide to:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Respond to your inquiries and quote requests</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Recommend suitable billboard advertising options</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Communicate with potential customers about campaign opportunities</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Improve our services and website experience</li>
            <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" /> Keep records of business communications</li>
          </ul>

          <h2 className="mt-10 font-display text-2xl font-bold">3. How we protect your information</h2>
          <p className="text-muted-foreground">
            We take reasonable care to keep the information you share with us secure.
            Access is limited to the Keikol team members who need it to respond to your request or manage our services.
            We do not sell your personal information to third parties.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">4. Cookies and analytics</h2>
          <p className="text-muted-foreground">
            The Keikol website may use standard cookies and analytics tools to understand how visitors use the site and improve its performance.
            These tools do not identify you personally unless you choose to submit a form or contact us.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">5. Your choices</h2>
          <p className="text-muted-foreground">
            You are not required to submit any information to browse the website.
            If you choose to contact us or request a quote, you can request that we update or delete your information at any time by emailing us.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">6. Changes to this policy</h2>
          <p className="text-muted-foreground">
            Keikol Media Ltd may update this Privacy Policy from time to time as our services and website evolve.
            We will post the updated version on this page with a revised date.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">7. Contact us</h2>
          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy or how we handle your information, please contact us at{" "}
            <a href="mailto:info@keikol.com" className="text-gold hover:underline">
              info@keikol.com
            </a>.
          </p>
        </div>
      </Section>
    </>
  );
}
