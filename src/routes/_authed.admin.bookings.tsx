import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/lib/firebase";
import { useBookings } from "@/lib/bookings-data";
import { BOOKING_STATUS_CLASSES, type Booking } from "@/lib/booking-types";
import type { BookingStatus } from "@/lib/booking-status";

export const Route = createFileRoute("/_authed/admin/bookings")({
  head: () => ({
    meta: [{ title: "Admin — Bookings — Keikol" }],
  }),
  component: AdminBookingsPage,
});

const STATUS_OPTIONS: BookingStatus[] = [
  "pending_payment",
  "under_review",
  "confirmed",
  "cancelled",
];

async function updateBookingStatus(booking: Booking, status: BookingStatus) {
  const batch = writeBatch(db);
  batch.update(doc(db, "bookings", booking.id), { status, updatedAt: serverTimestamp() });

  // Keep the public availability mirror in sync with the real status in the
  // same atomic commit, so they can never drift apart from a partial write.
  const windowRef = doc(db, "publicBookingWindows", booking.id);
  if (status === "confirmed") {
    batch.set(windowRef, {
      billboardId: booking.billboardId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: "confirmed",
    });
  } else {
    batch.delete(windowRef);
  }

  await batch.commit();
}

function AdminBookingsPage() {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useBookings();

  const mutation = useMutation({
    mutationFn: ({ booking, status }: { booking: Booking; status: BookingStatus }) =>
      updateBookingStatus(booking, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["public-booking-windows"] });
    },
    onError: () => {
      toast.error("Couldn't update booking status. Please try again.");
    },
  });

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={
          <>
            All <span className="text-gradient-gold">Bookings</span>
          </>
        }
        subtitle="Review campaign bookings across all customers and update their status."
      />

      <div className="mt-10 overflow-x-auto rounded-2xl bg-card-premium shadow-elegant ring-hairline">
        {isLoading && (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (!bookings || bookings.length === 0) && (
          <p className="p-6 text-sm text-muted-foreground">No bookings yet.</p>
        )}

        {!isLoading && bookings && bookings.length > 0 && (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Billboard</th>
                <th className="px-5 py-4">Dates</th>
                <th className="px-5 py-4">Budget</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const s = BOOKING_STATUS_CLASSES[b.status];
                const isSaving = mutation.isPending && mutation.variables?.booking.id === b.id;
                return (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{b.companyName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{b.contactEmail}</p>
                      {b.artworkPaths?.length > 0 && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Paperclip className="h-3 w-3" /> Artwork attached
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                        {b.billboardSnapshot.city}
                      </p>
                      <p>{b.billboardSnapshot.area}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.billboardSnapshot.billboardType}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {b.startDate} – {b.endDate}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{b.budget}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
                      </span>
                      <select
                        value={b.status}
                        disabled={isSaving}
                        onChange={(e) =>
                          mutation.mutate({ booking: b, status: e.target.value as BookingStatus })
                        }
                        className="block w-full appearance-none rounded-lg border border-border bg-background/60 px-3 py-2 text-xs focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {BOOKING_STATUS_CLASSES[opt].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Section>
  );
}
