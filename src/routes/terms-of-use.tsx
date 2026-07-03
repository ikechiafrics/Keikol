import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components";

export const Route = createFileRoute("/terms-of-use")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Keikol" },
      {
        name: "description",
        content:
          "Read the Terms of Use for browsing the Keikol website and requesting billboard advertising quotes.",
      },
      { property: "og:title", content: "Terms of Use — Keikol" },
      {
        property: "og:description",
        content:
          "The terms that apply to using the Keikol website and submitting quote requests.",
      },
      { property: "og:url", content: "/terms-of-use" },
    ],
    links: [{ rel: "canonical", href: "/terms-of-use" }],
  }),
  component: TermsOfUsePage,
});

function TermsOfUsePage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={<>Terms of <span className="text-gradient-gold">Use</span></>}
        subtitle="Last updated: June 2026"
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="text-muted-foreground">
            Welcome to the Keikol website. These Terms of Use describe the rules for using our website and submitting quote requests.
            By using this website, you agree to these terms. Keikol is the public brand of{" "}
            <strong className="text-foreground">Keikol Media Ltd</strong>.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">1. Website content is for general information</h2>
          <p className="text-muted-foreground">
            The content on this website is provided for general information about Keikol and our billboard advertising services.
            It does not form a binding contract, guarantee, or legal advice. Information may change as our services grow.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">2. Billboard availability, pricing, and impressions are estimates</h2>
          <p className="text-muted-foreground">
            The billboard locations, prices, sizes, and estimated daily impressions shown on this website are for guidance only.
            They are not final offers. Actual availability, pricing, and performance depend on location, season, demand, and confirmation by the Keikol team.
            Please contact us to confirm details before making any business decisions.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">3. Quote requests are not confirmed bookings</h2>
          <p className="text-muted-foreground">
            Submitting a quote request through the website is a way to express interest and start a conversation.
            It does not create a confirmed booking, reservation, or contract.
            A Keikol team member will contact you to discuss availability, pricing, and next steps.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">4. Provide accurate information</h2>
          <p className="text-muted-foreground">
            When you contact us or request a quote, please provide accurate and truthful information.
            This helps us respond properly and recommend the right billboard opportunities for your campaign.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">5. Updates to website content</h2>
          <p className="text-muted-foreground">
            Keikol Media Ltd may update website content, features, and services over time.
            We do our best to keep information accurate, but we are not responsible for outdated or incomplete information that may appear between updates.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">6. Intellectual property</h2>
          <p className="text-muted-foreground">
            The website design, text, images, logos, and other content are owned by or licensed to Keikol Media Ltd.
            You may view and share the website for personal or business reference, but you may not copy, modify, or reuse content without permission.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">7. Limitation of liability</h2>
          <p className="text-muted-foreground">
            To the fullest extent allowed by law, Keikol Media Ltd is not liable for any loss or damage resulting from your use of this website or reliance on its content.
            All campaign decisions should be made after direct confirmation with the Keikol team.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">8. Changes to these terms</h2>
          <p className="text-muted-foreground">
            We may update these Terms of Use from time to time. The updated version will be posted on this page with a revised date.
            Continued use of the website after changes means you accept the updated terms.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">9. Contact us</h2>
          <p className="text-muted-foreground">
            If you have questions about these Terms of Use, please contact us at{" "}
            <a href="mailto:info@keikolmedia.com" className="text-gold hover:underline">
              info@keikolmedia.com
            </a>.
          </p>
        </div>
      </Section>
    </>
  );
}
