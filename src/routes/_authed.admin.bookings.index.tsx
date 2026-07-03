import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  AlertTriangle,
  Ban,
  Calendar as CalIcon,
  FileUp,
  Paperclip,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { db } from "@/lib/firebase";
import { rangesOverlap } from "@/lib/billboard-availability";
import { useAuth } from "@/lib/auth-context";
import { useBookings } from "@/lib/bookings-data";
import { useInvoicesForBooking, fetchAllInvoices } from "@/lib/invoices-data";
import { useArtworkUrls } from "@/lib/use-artwork-urls";
import { addBookingArtwork } from "@/lib/booking-artwork";
import { generateInvoiceNumber, formatNaira } from "@/lib/invoice";
import { parseAmount, formatAmountInput } from "@/lib/currency-input";
import { logAudit, type AuditActor } from "@/lib/audit-log";
import { downloadCsv } from "@/lib/csv-export";
import {
  BOOKING_STATUS_CLASSES,
  isStalePendingBooking,
  STALE_PENDING_DAYS,
  type Booking,
} from "@/lib/booking-types";
import { INVOICE_STATUS_CLASSES, type Invoice } from "@/lib/invoice-types";
import type { BookingStatus } from "@/lib/booking-status";

export const Route = createFileRoute("/_authed/admin/bookings/")({
  head: () => ({
    meta: [{ title: "Admin — Bookings — Keikol" }],
  }),
  component: AdminBookingsPage,
});

const STATUS_OPTIONS: BookingStatus[] = [
  "pending_payment",
  "under_review",
  "confirmed",
  "cancellation_requested",
  "cancelled",
];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

class BookingConflictError extends Error {}

async function assertNoConfirmedConflict(booking: Booking) {
  const snap = await getDocs(
    query(
      collection(db, "publicBookingWindows"),
      where("billboardId", "==", booking.billboardId),
    ),
  );
  const conflict = snap.docs.some((d) => {
    if (d.id === booking.id) return false;
    const w = d.data() as { startDate: string; endDate: string };
    return rangesOverlap(booking.startDate, booking.endDate, w.startDate, w.endDate);
  });
  if (conflict) {
    throw new BookingConflictError(
      "This billboard already has a confirmed booking for an overlapping date range.",
    );
  }
}

async function updateBookingStatus(booking: Booking, status: BookingStatus, actor: AuditActor) {
  if (status === "confirmed") {
    await assertNoConfirmedConflict(booking);
  }

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

  logAudit(batch, actor, {
    action: "booking.status_changed",
    targetType: "booking",
    targetId: booking.id,
    summary: `Changed booking status for ${booking.companyName || booking.id} from "${booking.status}" to "${status}"`,
  });

  await batch.commit();
}

async function deleteBooking(booking: Booking, actor: AuditActor) {
  const invoicesSnap = await getDocs(
    query(collection(db, "invoices"), where("bookingId", "==", booking.id)),
  );

  const batch = writeBatch(db);
  invoicesSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "bookings", booking.id));
  logAudit(batch, actor, {
    action: "booking.deleted",
    targetType: "booking",
    targetId: booking.id,
    summary: `Deleted cancelled booking for ${booking.companyName || booking.id}`,
  });
  await batch.commit();
}

async function setContractAmount(booking: Booking, amount: number, actor: AuditActor) {
  const batch = writeBatch(db);
  batch.update(doc(db, "bookings", booking.id), {
    contractAmount: amount,
    updatedAt: serverTimestamp(),
  });
  logAudit(batch, actor, {
    action: "booking.contract_amount_set",
    targetType: "booking",
    targetId: booking.id,
    summary: `Set contract amount for ${booking.companyName || booking.id} to ${formatNaira(amount)}`,
  });
  await batch.commit();
}

async function createInvoice(booking: Booking, amount: number, dueDate: string, actor: AuditActor) {
  const invoiceRef = doc(collection(db, "invoices"));
  const invoiceNumber = generateInvoiceNumber(booking.id);
  const batch = writeBatch(db);
  batch.set(invoiceRef, {
    bookingId: booking.id,
    userId: booking.userId,
    invoiceNumber,
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
  logAudit(batch, actor, {
    action: "invoice.created",
    targetType: "invoice",
    targetId: invoiceRef.id,
    summary: `Created invoice ${invoiceNumber} for ${formatNaira(amount)} on booking ${booking.companyName || booking.id}`,
  });
  await batch.commit();
}

async function toggleInvoicePaid(invoice: Invoice, actor: AuditActor) {
  const next = invoice.status === "paid" ? "unpaid" : "paid";
  const batch = writeBatch(db);
  batch.update(doc(db, "invoices", invoice.id), {
    status: next,
    paidAt: next === "paid" ? serverTimestamp() : null,
  });
  logAudit(batch, actor, {
    action: "invoice.status_changed",
    targetType: "invoice",
    targetId: invoice.id,
    summary: `Marked invoice ${invoice.invoiceNumber} as ${next}`,
  });
  await batch.commit();
}

function AdminBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [managingBooking, setManagingBooking] = useState<Booking | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Booking | null>(null);

  const { data: bookings, isLoading } = useBookings();

  const mutation = useMutation({
    mutationFn: ({ booking, status }: { booking: Booking; status: BookingStatus }) =>
      updateBookingStatus(booking, status, { uid: user!.uid, email: user!.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["public-booking-windows"] });
    },
    onError: (err) => {
      toast.error(
        err instanceof BookingConflictError
          ? err.message
          : "Couldn't update booking status. Please try again.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (booking: Booking) =>
      deleteBooking(booking, { uid: user!.uid, email: user!.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking deleted.");
      setPendingDelete(null);
    },
    onError: () => toast.error("Couldn't delete this booking. Please try again."),
  });

  const [exportingInvoices, setExportingInvoices] = useState(false);

  function handleExportBookings() {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export.");
      return;
    }
    downloadCsv(
      `keikol-bookings-${toISODate(new Date())}.csv`,
      [
        "Company",
        "Contact Email",
        "Contact Phone",
        "City",
        "Area",
        "Billboard Type",
        "Start Date",
        "End Date",
        "Budget",
        "Goal",
        "Duration",
        "Status",
        "Contract Amount",
        "Created At",
      ],
      bookings.map((b) => [
        b.companyName,
        b.contactEmail,
        b.contactPhone,
        b.billboardSnapshot.city,
        b.billboardSnapshot.area,
        b.billboardSnapshot.billboardType,
        b.startDate,
        b.endDate,
        b.budget,
        b.goal,
        b.duration,
        BOOKING_STATUS_CLASSES[b.status].label ?? b.status,
        b.contractAmount ?? "",
        b.createdAt ? b.createdAt.toDate().toISOString() : "",
      ]),
    );
  }

  async function handleExportInvoices() {
    setExportingInvoices(true);
    try {
      const invoices = await fetchAllInvoices();
      if (invoices.length === 0) {
        toast.error("No invoices to export.");
        return;
      }
      downloadCsv(
        `keikol-invoices-${toISODate(new Date())}.csv`,
        ["Invoice Number", "Company", "Amount", "Status", "Due Date", "Issued At", "Paid At"],
        invoices.map((inv) => [
          inv.invoiceNumber,
          inv.bookingSnapshot.companyName,
          inv.amount,
          inv.status,
          inv.dueDate ?? "",
          inv.issuedAt ? inv.issuedAt.toDate().toISOString() : "",
          inv.paidAt ? inv.paidAt.toDate().toISOString() : "",
        ]),
      );
    } catch {
      toast.error("Couldn't export invoices. Please try again.");
    } finally {
      setExportingInvoices(false);
    }
  }

  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-4">
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBookings}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold hover:border-gold hover:text-gold"
          >
            <FileUp className="h-4 w-4" /> Export Bookings CSV
          </button>
          <button
            onClick={handleExportInvoices}
            disabled={exportingInvoices}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold hover:border-gold hover:text-gold disabled:opacity-60"
          >
            <FileUp className="h-4 w-4" />{" "}
            {exportingInvoices ? "Exporting…" : "Export Invoices CSV"}
          </button>
          <Link
            to="/admin/bookings/new"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> Create Booking
          </Link>
        </div>
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
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const s = BOOKING_STATUS_CLASSES[b.status];
                const isSaving = mutation.isPending && mutation.variables?.booking.id === b.id;
                const stale = isStalePendingBooking(b);
                return (
                  <tr
                    key={b.id}
                    className={`border-b border-border last:border-0 ${stale ? "bg-destructive/5" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{b.companyName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{b.contactEmail}</p>
                      {stale && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <AlertTriangle className="h-3 w-3" /> Pending {STALE_PENDING_DAYS}+ days
                        </span>
                      )}
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
                      {b.status === "cancellation_requested" ? (
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => mutation.mutate({ booking: b, status: "cancelled" })}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
                          >
                            <Ban className="h-3.5 w-3.5" /> Approve Cancellation
                          </button>
                          <button
                            onClick={() => mutation.mutate({ booking: b, status: "confirmed" })}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10 disabled:opacity-60"
                          >
                            <Undo2 className="h-3.5 w-3.5" /> Deny
                          </button>
                        </div>
                      ) : (
                        <select
                          value={b.status}
                          disabled={isSaving}
                          onChange={(e) =>
                            mutation.mutate({
                              booking: b,
                              status: e.target.value as BookingStatus,
                            })
                          }
                          className="block w-full appearance-none rounded-lg border border-border bg-background/60 px-3 py-2 text-xs focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {BOOKING_STATUS_CLASSES[opt].label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setManagingBooking(b)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                        >
                          <Receipt className="h-3.5 w-3.5" /> Manage
                        </button>
                        <Link
                          to="/admin/bookings/$id"
                          params={{ id: b.id }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-gold hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        {b.status === "cancelled" && (
                          <button
                            onClick={() => setPendingDelete(b)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ManageBookingDialog
        booking={managingBooking}
        onOpenChange={(open) => !open && setManagingBooking(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the cancelled booking for{" "}
              {pendingDelete?.companyName || "this customer"} along with any invoices issued against
              it. This can't be undone.
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

function ManageBookingDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [contractAmountInput, setContractAmountInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");

  const { data: invoices, isLoading } = useInvoicesForBooking(booking?.id);
  const totalInvoiced = (invoices ?? []).reduce((sum, inv) => sum + inv.amount, 0);

  const contractMutation = useMutation({
    mutationFn: ({ booking, amount }: { booking: Booking; amount: number }) =>
      setContractAmount(booking, amount, { uid: user!.uid, email: user!.email }),
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
    }) => createInvoice(booking, amount, dueDate, { uid: user!.uid, email: user!.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", booking?.id] });
      toast.success("Invoice added.");
      setAmountInput("");
      setDueDateInput("");
    },
    onError: () => toast.error("Couldn't create the invoice. Please try again."),
  });

  const paidMutation = useMutation({
    mutationFn: (invoice: Invoice) =>
      toggleInvoicePaid(invoice, { uid: user!.uid, email: user!.email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices", booking?.id] }),
    onError: () => toast.error("Couldn't update invoice status. Please try again."),
  });

  const [artworkProgress, setArtworkProgress] = useState<number | null>(null);
  const artworkMutation = useMutation({
    mutationFn: (file: File) =>
      addBookingArtwork(booking!.id, booking!.userId, file, setArtworkProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Artwork added.");
      setArtworkProgress(null);
    },
    onError: (err) => {
      console.error("Artwork upload failed:", err);
      toast.error("Couldn't upload that file. Please try again.");
      setArtworkProgress(null);
    },
  });

  function onArtworkFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !booking) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB.");
      return;
    }
    if (!/^image\/|^application\/pdf$/.test(file.type)) {
      toast.error("Only images or PDF files are accepted.");
      return;
    }
    artworkMutation.mutate(file);
  }

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
          <DialogTitle>Manage Booking — {booking?.companyName || "Booking"}</DialogTitle>
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
              Artwork
            </p>
            {booking && <ArtworkList paths={booking.artworkPaths} />}
            <label className="mt-2 flex w-fit cursor-pointer items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-gold">
              <Upload className="h-3 w-3" />
              {artworkMutation.isPending
                ? `Uploading… ${artworkProgress ?? 0}%`
                : "Attach artwork on customer's behalf"}
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={onArtworkFileChange}
                disabled={artworkMutation.isPending}
                className="hidden"
              />
            </label>
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

function ArtworkList({ paths }: { paths: string[] }) {
  const { data: files } = useArtworkUrls(paths);

  if (!files || files.length === 0) {
    return <p className="text-sm text-muted-foreground">No artwork attached yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {files.map((f) => (
        <a
          key={f.path}
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-gold"
        >
          <Paperclip className="h-3 w-3 shrink-0" /> <span className="truncate">{f.name}</span>
        </a>
      ))}
    </div>
  );
}
