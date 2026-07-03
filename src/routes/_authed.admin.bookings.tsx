import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { Calendar as CalIcon, Paperclip, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useBookings } from "@/lib/bookings-data";
import { useInvoicesForBooking } from "@/lib/invoices-data";
import { generateInvoiceNumber, formatNaira } from "@/lib/invoice";
import { BOOKING_STATUS_CLASSES, type Booking } from "@/lib/booking-types";
import { INVOICE_STATUS_CLASSES, type Invoice } from "@/lib/invoice-types";
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

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Amount inputs accept comma-formatted numbers ("500,000") — strip everything
// but digits to get the real number back out.
function parseAmount(input: string): number {
  return Number(input.replace(/[^0-9]/g, ""));
}

// Re-inserts thousands separators as the user types, so "500000" becomes
// "500,000" without them needing to type the commas themselves.
function formatAmountInput(input: string): string {
  const digits = input.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

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

async function setContractAmount(booking: Booking, amount: number) {
  await updateDoc(doc(db, "bookings", booking.id), {
    contractAmount: amount,
    updatedAt: serverTimestamp(),
  });
}

async function createInvoice(booking: Booking, amount: number, dueDate: string) {
  await setDoc(doc(collection(db, "invoices")), {
    bookingId: booking.id,
    userId: booking.userId,
    invoiceNumber: generateInvoiceNumber(booking.id),
    amount,
    status: "unpaid",
    dueDate: dueDate || null,
    issuedAt: serverTimestamp(),
    paidAt: null,
    bookingSnapshot: {
      companyName: booking.companyName,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      billboardCity: booking.billboardSnapshot.city,
      billboardArea: booking.billboardSnapshot.area,
      billboardType: booking.billboardSnapshot.billboardType,
      billboardSize: booking.billboardSnapshot.size,
      campaignStartDate: booking.startDate,
      campaignEndDate: booking.endDate,
      campaignDuration: booking.duration,
      campaignGoal: booking.goal,
    },
  });
}

async function toggleInvoicePaid(invoice: Invoice) {
  const next = invoice.status === "paid" ? "unpaid" : "paid";
  await updateDoc(doc(db, "invoices", invoice.id), {
    status: next,
    paidAt: next === "paid" ? serverTimestamp() : null,
  });
}

function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [managingBooking, setManagingBooking] = useState<Booking | null>(null);

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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Billboard</th>
                <th className="px-5 py-4">Dates</th>
                <th className="px-5 py-4">Budget</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Invoices</th>
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
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setManagingBooking(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                      >
                        <Receipt className="h-3.5 w-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ManageInvoicesDialog
        booking={managingBooking}
        onOpenChange={(open) => !open && setManagingBooking(null)}
      />
    </Section>
  );
}

function ManageInvoicesDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [contractAmountInput, setContractAmountInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");

  const { data: invoices, isLoading } = useInvoicesForBooking(booking?.id);
  const totalInvoiced = (invoices ?? []).reduce((sum, inv) => sum + inv.amount, 0);

  const contractMutation = useMutation({
    mutationFn: ({ booking, amount }: { booking: Booking; amount: number }) =>
      setContractAmount(booking, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Contract amount saved.");
    },
    onError: () => toast.error("Couldn't save the contract amount. Please try again."),
  });

  const invoiceMutation = useMutation({
    mutationFn: ({
      booking,
      amount,
      dueDate,
    }: {
      booking: Booking;
      amount: number;
      dueDate: string;
    }) => createInvoice(booking, amount, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", booking?.id] });
      toast.success("Invoice added.");
      setAmountInput("");
      setDueDateInput("");
    },
    onError: () => toast.error("Couldn't create the invoice. Please try again."),
  });

  const paidMutation = useMutation({
    mutationFn: (invoice: Invoice) => toggleInvoicePaid(invoice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices", booking?.id] }),
    onError: () => toast.error("Couldn't update invoice status. Please try again."),
  });

  function submitContractAmount() {
    if (!booking) return;
    const amount = parseAmount(contractAmountInput);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    contractMutation.mutate({ booking, amount });
  }

  function submitInvoice() {
    if (!booking) return;
    const amount = parseAmount(amountInput);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    invoiceMutation.mutate({ booking, amount, dueDate: dueDateInput });
  }

  return (
    <Dialog open={booking !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoices — {booking?.companyName || "Booking"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Total Contract Amount (₦)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={contractAmountInput}
                onChange={(e) => setContractAmountInput(formatAmountInput(e.target.value))}
                placeholder={
                  booking?.contractAmount
                    ? booking.contractAmount.toLocaleString("en-NG")
                    : "900,000"
                }
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <button
                onClick={submitContractAmount}
                disabled={contractMutation.isPending}
                className="flex-none rounded-xl border border-border bg-surface/60 px-4 py-2.5 text-xs font-semibold hover:border-gold hover:text-gold disabled:opacity-60"
              >
                Save
              </button>
            </div>
            {booking?.contractAmount && (
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNaira(totalInvoiced)} of {formatNaira(booking.contractAmount)} invoiced
              </p>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Invoices
            </p>
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!isLoading && (!invoices || invoices.length === 0) && (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            )}
            {!isLoading && invoices && invoices.length > 0 && (
              <div className="space-y-2">
                {invoices.map((inv) => {
                  const s = INVOICE_STATUS_CLASSES[inv.status];
                  const isToggling =
                    paidMutation.isPending && paidMutation.variables?.id === inv.id;
                  return (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-background/60 p-3"
                    >
                      <div>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {inv.invoiceNumber}
                        </p>
                        <p className="text-sm font-semibold">{formatNaira(inv.amount)}</p>
                        {inv.dueDate && (
                          <p className="text-[11px] text-muted-foreground">Due {inv.dueDate}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
                        </span>
                        <button
                          onClick={() => paidMutation.mutate(inv)}
                          disabled={isToggling}
                          className="text-[11px] font-semibold text-gold hover:underline disabled:opacity-60"
                        >
                          {inv.status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                        </button>
                        <Link
                          to="/invoice/$id"
                          params={{ id: inv.id }}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-gold hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Add Invoice
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                inputMode="numeric"
                value={amountInput}
                onChange={(e) => setAmountInput(formatAmountInput(e.target.value))}
                placeholder="Amount (₦)"
                className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <div className="relative">
                <input
                  type="text"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 pr-10 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Pick a date"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold"
                    >
                      <CalIcon className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={dueDateInput ? new Date(`${dueDateInput}T00:00:00`) : undefined}
                      onSelect={(date) => setDueDateInput(date ? toISODate(date) : "")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={submitInvoice}
            disabled={invoiceMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold disabled:opacity-60"
          >
            {invoiceMutation.isPending ? "Adding…" : "Add Invoice"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
