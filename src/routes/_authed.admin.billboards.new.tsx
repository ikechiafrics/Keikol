import { createFileRoute } from "@tanstack/react-router";

import { Section, SectionHeader } from "@/components";
import { BillboardForm } from "@/components/BillboardForm";

export const Route = createFileRoute("/_authed/admin/billboards/new")({
  head: () => ({
    meta: [{ title: "Add Billboard — Admin — Keikol" }],
  }),
  component: NewBillboardPage,
});

function NewBillboardPage() {
  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={<>Add a new <span className="text-gradient-gold">billboard.</span></>}
      />
      <div className="mt-10">
        <BillboardForm mode="create" />
      </div>
    </Section>
  );
}
