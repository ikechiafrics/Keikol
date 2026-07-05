import { createFileRoute } from "@tanstack/react-router";

import { Section, SectionHeader } from "@/components";
import { PhotographerForm } from "@/components/PhotographerForm";

export const Route = createFileRoute("/_authed/admin/photographers/new")({
  head: () => ({
    meta: [{ title: "Add Photographer — Admin — Keikol" }],
  }),
  component: NewPhotographerPage,
});

function NewPhotographerPage() {
  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={
          <>
            Add a new <span className="text-gradient-gold">photographer.</span>
          </>
        }
      />
      <div className="mt-10">
        <PhotographerForm mode="create" />
      </div>
    </Section>
  );
}
