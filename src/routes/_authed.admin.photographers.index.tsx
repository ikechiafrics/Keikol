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
import { usePhotographers } from "@/lib/photographers-data";
import { logAudit, type AuditActor } from "@/lib/audit-log";
import type { Photographer } from "@/lib/photographer-types";
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

export const Route = createFileRoute("/_authed/admin/photographers/")({
  head: () => ({
    meta: [{ title: "Admin — Photographers — Keikol" }],
  }),
  component: AdminPhotographersPage,
});

async function deletePhotographer(photographer: Photographer, actor: AuditActor) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "photographers", photographer.id));
  logAudit(batch, actor, {
    action: "photographer.deleted",
    targetType: "photographer",
    targetId: photographer.id,
    summary: `Deleted photographer profile "${photographer.name}"`,
  });
  await batch.commit();
}

function AdminPhotographersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: photographers, isLoading } = usePhotographers();
  const [pendingDelete, setPendingDelete] = useState<Photographer | null>(null);

  const mutation = useMutation({
    mutationFn: (photographer: Photographer) =>
      deletePhotographer(photographer, { uid: user!.uid, email: user!.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photographers"] });
      queryClient.invalidateQueries({ queryKey: ["photographers"] });
      toast.success("Photographer deleted.");
      setPendingDelete(null);
    },
    onError: () => {
      toast.error("Couldn't delete this profile. Please try again.");
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
              Manage <span className="text-gradient-gold">Photographers</span>
            </>
          }
          subtitle="Add, edit, or remove partnered photographers/videographers shown in the public directory."
        />
        <Link
          to="/admin/photographers/new"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add Photographer
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

        {!isLoading && (!photographers || photographers.length === 0) && (
          <p className="p-6 text-sm text-muted-foreground">
            No photographers yet. Click "Add Photographer" to create one.
          </p>
        )}

        {!isLoading && photographers && photographers.length > 0 && (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Photographer</th>
                <th className="px-5 py-4">Specialties</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Currency</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {photographers.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.profileImage ? (
                        <img
                          src={p.profileImage}
                          alt={p.name}
                          className="h-12 w-12 flex-none rounded-lg object-cover"
                        />
                      ) : (
                        <div className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-surface text-muted-foreground">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                      <p className="font-semibold">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {p.specialties.join(", ")}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {p.city}, {p.country}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.currency}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        p.active ? "bg-green-500/20 text-green-600" : "bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      {p.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to="/admin/photographers/$id"
                        params={{ id: p.id }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => setPendingDelete(p)}
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
            <AlertDialogTitle>Delete "{pendingDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the photographer's profile from the site. This can't be
              undone.
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
