import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";

import { Section, SectionHeader } from "@/components";
import { db } from "@/lib/firebase";
import { useInvoicesForBooking } from "@/lib/invoices-data";
import { formatNaira } from "@/lib/invoice";
import { INVOICE_STATUS_CLASSES } from "@/lib/invoice-types";
import type { Booking } from "@/lib/booking-types";

export const Route = createFileRoute("/_authed/invoices/$bookingId")({
  head: () => ({
    meta: [{ title: "Invoices — Keikol" }],
  }),
  component: InvoicesListPage,
});

async function fetchBooking(id: string): Promise<Booking> {
  const snap = await getDoc(doc(db, "bookings", id));
  if (!snap.exists()) throw new Error("not-found");
  return { id: snap.id, ...snap.data() } as Booking;
}

function InvoicesListPage() {
  const { bookingId } = Route.useParams();

  const {
    data: booking,
    isLoading: bookingLoading,
    isError: bookingError,
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => fetchBooking(bookingId),
  });

  const { data: invoices, isLoading: invoicesLoading } = useInvoicesForBooking(bookingId);

  const isLoading = bookingLoading || invoicesLoading;
  const totalInvoiced = (invoices ?? []).reduce((sum, inv) => sum + inv.amount, 0);

  if (bookingError || (!bookingLoading && !booking)) {
    return (
      <Section>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface/40 p-10 text-center">
          <h1 className="font-display text-xl font-bold">
            You don't have access to these invoices
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This booking doesn't exist, or you don't have permission to view it.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Invoices"
        title={
          <>
            {booking
              ? `${booking.billboardSnapshot.area}, ${booking.billboardSnapshot.city}`
              : "Invoices"}
          </>
        }
        subtitle={
          booking?.contractAmount
            ? `${formatNaira(totalInvoiced)} of ${formatNaira(booking.contractAmount)} invoiced`
            : undefined
        }
      />

      <div className="mt-10">
        {isLoading && <p className="text-sm text-muted-foreground">Loading invoices…</p>}

        {!isLoading && (!invoices || invoices.length === 0) && (
          <p className="rounded-2xl border border-border bg-surface/40 p-10 text-center text-sm text-muted-foreground">
            No invoices have been issued for this booking yet.
          </p>
        )}

        {!isLoading && invoices && invoices.length > 0 && (
          <div className="space-y-3">
            {invoices.map((inv) => {
              const s = INVOICE_STATUS_CLASSES[inv.status];
              return (
                <Link
                  key={inv.id}
                  to="/invoice/$id"
                  params={{ id: inv.id }}
                  className="flex items-center justify-between rounded-2xl bg-card-premium p-5 shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow-soft"
                >
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                    <p className="mt-1 font-display text-lg font-bold">{formatNaira(inv.amount)}</p>
                    {inv.dueDate && (
                      <p className="mt-1 text-xs text-muted-foreground">Due {inv.dueDate}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}
