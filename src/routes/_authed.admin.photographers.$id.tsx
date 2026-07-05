import { createFileRoute } from "@tanstack/react-router";

import { Section, SectionHeader } from "@/components";
import { PhotographerForm } from "@/components/PhotographerForm";
import { usePhotographer } from "@/lib/photographers-data";

export const Route = createFileRoute("/_authed/admin/photographers/$id")({
  head: () => ({
    meta: [{ title: "Edit Photographer — Admin — Keikol" }],
  }),
  component: EditPhotographerPage,
});

function EditPhotographerPage() {
  const { id } = Route.useParams();
  const { data: photographer, isLoading } = usePhotographer(id);

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={
          <>
            Edit <span className="text-gradient-gold">photographer.</span>
          </>
        }
      />
      <div className="mt-10">
        {isLoading && <p className="text-sm text-muted-foreground">Loading profile…</p>}
        {!isLoading && !photographer && (
          <p className="text-sm text-muted-foreground">Photographer not found.</p>
        )}
        {!isLoading && photographer && (
          <PhotographerForm mode="edit" initialValues={photographer} photographerId={photographer.id} />
        )}
      </div>
    </Section>
  );
}
