import { createFileRoute } from "@tanstack/react-router";

import { Section, SectionHeader } from "@/components";
import { BillboardForm } from "@/components/BillboardForm";
import { useBillboard } from "@/lib/billboards-data";

export const Route = createFileRoute("/_authed/admin/billboards/$id")({
  head: () => ({
    meta: [{ title: "Edit Billboard — Admin — Keikol" }],
  }),
  component: EditBillboardPage,
});

function EditBillboardPage() {
  const { id } = Route.useParams();
  const { data: billboard, isLoading } = useBillboard(id);

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={<>Edit <span className="text-gradient-gold">billboard.</span></>}
      />
      <div className="mt-10">
        {isLoading && <p className="text-sm text-muted-foreground">Loading billboard…</p>}
        {!isLoading && !billboard && <p className="text-sm text-muted-foreground">Billboard not found.</p>}
        {!isLoading && billboard && (
          <BillboardForm mode="edit" initialValues={billboard} billboardId={billboard.id} />
        )}
      </div>
    </Section>
  );
}
