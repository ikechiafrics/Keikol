import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, writeBatch } from "firebase/firestore";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useBillboards } from "@/lib/billboards-data";
import { getPriceTierLabel } from "@/lib/billboard-rates";
import { logAudit, type AuditActor } from "@/lib/audit-log";
import type { Billboard } from "@/data/billboards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authed/admin/billboards/")({
  head: () => ({
    meta: [{ title: "Admin — Billboards — Keikol" }],
  }),
  component: AdminBillboardsPage,
});

async function deleteBillboard(billboard: Billboard, actor: AuditActor) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "billboards", billboard.id));
  logAudit(batch, actor, {
    action: "billboard.deleted",
    targetType: "billboard",
    targetId: billboard.id,
    summary: `Deleted billboard "${billboard.area}, ${billboard.city}"`,
  });
  await batch.commit();
}

function AdminBillboardsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: billboards, isLoading } = useBillboards();
  const [pendingDelete, setPendingDelete] = useState<Billboard | null>(null);

  const mutation = useMutation({
    mutationFn: (billboard: Billboard) =>
      deleteBillboard(billboard, { uid: user!.uid, email: user!.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-billboards"] });
      queryClient.invalidateQueries({ queryKey: ["billboards"] });
      toast.success("Billboard deleted.");
      setPendingDelete(null);
    },
    onError: () => {
      toast.error("Couldn't delete this billboard. Please try again.");
    },
  });

  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader
          align="left"
          eyebrow="Admin"
          title={
            <>
              Manage <span className="text-gradient-gold">Billboards</span>
            </>
          }
          subtitle="Add, edit, or remove billboard inventory shown across the site."
        />
        <Link
          to="/admin/billboards/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add Billboard
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl bg-card-premium shadow-elegant ring-hairline">
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (!billboards || billboards.length === 0) && (
          <p className="p-6 text-sm text-muted-foreground">
            No billboards yet. Click "Add Billboard" to create one.
          </p>
        )}

        {!isLoading && billboards && billboards.length > 0 && (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Billboard</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Availability</th>
                <th className="px-5 py-4">Price Tier</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {billboards.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {b.image ? (
                        <img
                          src={b.image}
                          alt={b.area}
                          className="h-12 w-16 flex-none rounded-lg object-cover"
                        />
                      ) : (
                        <div className="grid h-12 w-16 flex-none place-items-center rounded-lg bg-surface text-muted-foreground">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                          {b.city}
                        </p>
                        <p className="font-semibold">{b.area}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{b.billboardType}</td>
                  <td className="px-5 py-4 text-muted-foreground">{b.availability}</td>
                  <td className="px-5 py-4 text-muted-foreground">{getPriceTierLabel(b.rates)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to="/admin/billboards/$id"
                        params={{ id: b.id }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => setPendingDelete(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.area}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the billboard from the site. Past bookings for it are
              unaffected. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && mutation.mutate(pendingDelete)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}
