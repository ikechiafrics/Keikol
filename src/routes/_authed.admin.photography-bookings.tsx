import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { usePhotographyBookings } from "@/lib/photography-bookings-data";
import { logAudit, type AuditActor } from "@/lib/audit-log";
import {
  PHOTOGRAPHY_BOOKING_STATUS_CLASSES,
  type PhotographyBooking,
  type PhotographyBookingStatus,
} from "@/lib/photography-booking-types";
import { PhotographyBookingDialog } from "@/components/PhotographyBookingDialog";
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

export const Route = createFileRoute("/_authed/admin/photography-bookings")({
  head: () => ({
    meta: [{ title: "Admin — Photography Bookings — Keikol" }],
  }),
  component: AdminPhotographyBookingsPage,
});

const STATUS_OPTIONS: PhotographyBookingStatus[] = ["confirmed", "completed", "cancelled"];

async function updateStatus(
  booking: PhotographyBooking,
  status: PhotographyBookingStatus,
  actor: AuditActor,
) {
  const batch = writeBatch(db);
  batch.update(doc(db, "photographyBookings", booking.id), { status, updatedAt: serverTimestamp() });
  logAudit(batch, actor, {
    action: "photographyBooking.status_changed",
    targetType: "photographyBooking",
    targetId: booking.id,
    summary: `Changed photography booking status for ${booking.clientName} from "${booking.status}" to "${status}"`,
  });
  await batch.commit();
}

async function deletePhotographyBooking(booking: PhotographyBooking, actor: AuditActor) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "photographyBookings", booking.id));
  logAudit(batch, actor, {
    action: "photographyBooking.deleted",
    targetType: "photographyBooking",
    targetId: booking.id,
    summary: `Deleted photography booking for ${booking.clientName}`,
  });
  await batch.commit();
}

function AdminPhotographyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = usePhotographyBookings();
  const [pendingDelete, setPendingDelete] = useState<PhotographyBooking | null>(null);
  const [editing, setEditing] = useState<PhotographyBooking | null>(null);
  const [creating, setCreating] = useState(false);

  const statusMutation = useMutation({
    mutationFn: ({ booking, status }: { booking: PhotographyBooking; status: PhotographyBookingStatus }) =>
      updateStatus(booking, status, { uid: user!.uid, email: user!.email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photography-bookings"] }),
    onError: () => toast.error("Couldn't update this booking's status. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: (booking: PhotographyBooking) =>
      deletePhotographyBooking(booking, { uid: user!.uid, email: user!.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photography-bookings"] });
      toast.success("Booking deleted.");
      setPendingDelete(null);
    },
    onError: () => toast.error("Couldn't delete this booking. Please try again."),
  });

  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader
          align="left"
          eyebrow="Admin"
          title={
            <>
              Photography <span className="text-gradient-gold">Bookings</span>
            </>
          }
          subtitle="Confirmed photography/videography engagements — converted from a quote, or added directly."
        />
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add Booking
        </button>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl bg-card-premium shadow-elegant ring-hairline">
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (!bookings || bookings.length === 0) && (
          <p className="p-6 text-sm text-muted-foreground">
            No photography bookings yet. Convert a quote from Admin → Quotes, or click "Add
            Booking" to log one directly.
          </p>
        )}

        {!isLoading && bookings && bookings.length > 0 && (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Occasion</th>
                <th className="px-5 py-4">Event Date</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const classes = PHOTOGRAPHY_BOOKING_STATUS_CLASSES[b.status];
                return (
                  <tr key={b.id} className="border-b border-border align-top last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{b.clientName}</p>
                      <p className="text-xs text-muted-foreground">{b.clientEmail}</p>
                      <p className="text-xs text-muted-foreground">{b.clientPhone}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{b.occasion || "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{b.eventDate || "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">{b.location || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${classes.dot}`} />
                        <select
                          value={b.status}
                          disabled={
                            statusMutation.isPending && statusMutation.variables?.booking.id === b.id
                          }
                          onChange={(e) =>
                            statusMutation.mutate({
                              booking: b,
                              status: e.target.value as PhotographyBookingStatus,
                            })
                          }
                          className={`rounded-lg border border-border bg-background/60 px-2 py-1 text-xs font-semibold ${classes.text}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {PHOTOGRAPHY_BOOKING_STATUS_CLASSES[s].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEditing(b)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setPendingDelete(b)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <PhotographyBookingDialog
        open={creating}
        onOpenChange={setCreating}
        mode="create"
      />
      <PhotographyBookingDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        mode="edit"
        booking={editing}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking for "{pendingDelete?.clientName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the photography booking record. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}
