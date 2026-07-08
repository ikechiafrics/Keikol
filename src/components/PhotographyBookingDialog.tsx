import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, collection, serverTimestamp, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { logAudit } from "@/lib/audit-log";
import type { PhotographyBooking, PhotographyBookingStatus } from "@/lib/photography-booking-types";

const STATUS_OPTIONS: PhotographyBookingStatus[] = ["confirmed", "completed", "cancelled"];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground";

// Pre-fill values when opening the dialog from a quote request ("Convert to
// Booking") — quoteRequestId is what triggers also closing that quote in the
// same batch write on submit.
export interface PhotographyBookingPrefill {
  quoteRequestId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  occasion: string;
}

export function PhotographyBookingDialog({
  open,
  onOpenChange,
  mode,
  booking,
  prefill,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  booking?: PhotographyBooking | null;
  prefill?: PhotographyBookingPrefill | null;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<PhotographyBookingStatus>("confirmed");

  // Re-seed the form fields whenever the dialog is opened for a different
  // booking/prefill, rather than leaving stale values from a previous open.
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && booking) {
      setClientName(booking.clientName);
      setClientEmail(booking.clientEmail);
      setClientPhone(booking.clientPhone);
      setOccasion(booking.occasion);
      setEventDate(booking.eventDate);
      setLocation(booking.location);
      setNotes(booking.notes);
      setStatus(booking.status);
    } else {
      setClientName(prefill?.clientName ?? "");
      setClientEmail(prefill?.clientEmail ?? "");
      setClientPhone(prefill?.clientPhone ?? "");
      setOccasion(prefill?.occasion ?? "");
      setEventDate("");
      setLocation("");
      setNotes("");
      setStatus("confirmed");
    }
  }, [open, mode, booking, prefill]);

  const mutation = useMutation({
    mutationFn: async () => {
      const batch = writeBatch(db);
      const data = {
        clientName,
        clientEmail,
        clientPhone,
        occasion,
        eventDate,
        location,
        notes,
        status,
        updatedAt: serverTimestamp(),
      };

      if (mode === "edit" && booking) {
        batch.update(doc(db, "photographyBookings", booking.id), data);
        logAudit(
          batch,
          { uid: user!.uid, email: user!.email },
          {
            action: "photographyBooking.updated",
            targetType: "photographyBooking",
            targetId: booking.id,
            summary: `Updated photography booking for ${clientName}`,
          },
        );
      } else {
        const ref = doc(collection(db, "photographyBookings"));
        batch.set(ref, {
          ...data,
          quoteRequestId: prefill?.quoteRequestId ?? "",
          createdAt: serverTimestamp(),
        });
        if (prefill?.quoteRequestId) {
          batch.update(doc(db, "quoteRequests", prefill.quoteRequestId), {
            status: "closed",
            updatedAt: serverTimestamp(),
          });
        }
        logAudit(
          batch,
          { uid: user!.uid, email: user!.email },
          {
            action: "photographyBooking.created",
            targetType: "photographyBooking",
            targetId: ref.id,
            summary: `Created photography booking for ${clientName}${prefill?.quoteRequestId ? " (converted from a quote)" : ""}`,
          },
        );
      }

      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photography-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
      toast.success(mode === "edit" ? "Booking updated." : "Booking created.");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Couldn't save this booking. Please try again.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Booking" : "New Photography Booking"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Client Name</label>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Occasion</label>
              <input
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Weddings"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Event Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`${inputClass} flex items-center justify-between text-left`}
                  >
                    <span className={eventDate ? "" : "text-muted-foreground/70"}>
                      {eventDate || "Select a date"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate ? new Date(`${eventDate}T00:00:00`) : undefined}
                    onSelect={(date) => setEventDate(date ? toISODate(date) : "")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Venue / address"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Package, deliverables, anything discussed on the call..."
              className={inputClass}
            />
          </div>

          {mode === "edit" && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PhotographyBookingStatus)}
                className={`${inputClass} appearance-none`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !clientName}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {mutation.isPending ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Booking"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
