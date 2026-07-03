import { createFileRoute } from "@tanstack/react-router";
import { Building2, CalendarClock, FileText } from "lucide-react";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { useBillboards } from "@/lib/billboards-data";
import { useBookings } from "@/lib/bookings-data";
import { useQuoteRequests } from "@/lib/quotes-data";
import { BOOKING_STATUS_CLASSES } from "@/lib/booking-types";
import { QUOTE_STATUS_CLASSES } from "@/lib/quote-types";

export const Route = createFileRoute("/_authed/admin/")({
  head: () => ({
    meta: [{ title: "Admin — Overview — Keikol" }],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { data: billboards, isLoading: billboardsLoading } = useBillboards();
  const { data: quotes, isLoading: quotesLoading } = useQuoteRequests();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  const isLoading = billboardsLoading || quotesLoading || bookingsLoading;

  const quoteCounts = {
    new: quotes?.filter((q) => q.status === "new").length ?? 0,
    contacted: quotes?.filter((q) => q.status === "contacted").length ?? 0,
    closed: quotes?.filter((q) => q.status === "closed").length ?? 0,
  };

  const bookingCounts = {
    pending_payment: bookings?.filter((b) => b.status === "pending_payment").length ?? 0,
    under_review: bookings?.filter((b) => b.status === "under_review").length ?? 0,
    confirmed: bookings?.filter((b) => b.status === "confirmed").length ?? 0,
    cancellation_requested:
      bookings?.filter((b) => b.status === "cancellation_requested").length ?? 0,
    cancelled: bookings?.filter((b) => b.status === "cancelled").length ?? 0,
  };

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={
          <>
            Admin <span className="text-gradient-gold">Overview</span>
          </>
        }
        subtitle="A quick snapshot of billboard inventory, quote requests, and bookings that need attention."
      />

      {isLoading && (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-4 h-9 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Building2 className="h-4 w-4 text-gold" /> Billboards
            </div>
            <p className="mt-4 font-display text-4xl font-extrabold">{billboards?.length ?? 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Total listed on the site</p>
          </div>

          <div className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <FileText className="h-4 w-4 text-gold" /> Quote Requests
            </div>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${QUOTE_STATUS_CLASSES.new.dot}`} />
                  {QUOTE_STATUS_CLASSES.new.label}
                </dt>
                <dd className="font-semibold">{quoteCounts.new}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${QUOTE_STATUS_CLASSES.contacted.dot}`}
                  />
                  {QUOTE_STATUS_CLASSES.contacted.label}
                </dt>
                <dd className="font-semibold">{quoteCounts.contacted}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${QUOTE_STATUS_CLASSES.closed.dot}`} />
                  {QUOTE_STATUS_CLASSES.closed.label}
                </dt>
                <dd className="font-semibold">{quoteCounts.closed}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <CalendarClock className="h-4 w-4 text-gold" /> Bookings
            </div>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${BOOKING_STATUS_CLASSES.pending_payment.dot}`}
                  />
                  {BOOKING_STATUS_CLASSES.pending_payment.label}
                </dt>
                <dd className="font-semibold">{bookingCounts.pending_payment}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${BOOKING_STATUS_CLASSES.under_review.dot}`}
                  />
                  {BOOKING_STATUS_CLASSES.under_review.label}
                </dt>
                <dd className="font-semibold">{bookingCounts.under_review}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${BOOKING_STATUS_CLASSES.confirmed.dot}`}
                  />
                  {BOOKING_STATUS_CLASSES.confirmed.label}
                </dt>
                <dd className="font-semibold">{bookingCounts.confirmed}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${BOOKING_STATUS_CLASSES.cancellation_requested.dot}`}
                  />
                  {BOOKING_STATUS_CLASSES.cancellation_requested.label}
                </dt>
                <dd className="font-semibold">{bookingCounts.cancellation_requested}</dd>
              </div>
              <div className="flex items-center justify-between px-3 py-1">
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${BOOKING_STATUS_CLASSES.cancelled.dot}`}
                  />
                  {BOOKING_STATUS_CLASSES.cancelled.label}
                </dt>
                <dd className="font-semibold">{bookingCounts.cancelled}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </Section>
  );
}
