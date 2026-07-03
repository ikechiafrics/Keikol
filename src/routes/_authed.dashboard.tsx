import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import {
  ArrowRight,
  Ban,
  Calendar,
  ImageOff,
  MapPin,
  Paperclip,
  Receipt,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
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
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useImageLoaded } from "@/lib/use-image-loaded";
import { useArtworkUrls } from "@/lib/use-artwork-urls";
import { useInvoicesForBooking, useInvoicesForUser } from "@/lib/invoices-data";
import { cancelBooking, requestBookingCancellation } from "@/lib/bookings-data";
import { formatNaira } from "@/lib/invoice";
import { BOOKING_STATUS_CLASSES, type Booking } from "@/lib/booking-types";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({
    meta: [{ title: "My Dashboard — Keikol" }],
  }),
  component: DashboardPage,
});

async function fetchBookings(uid: string): Promise<Booking[]> {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

function DashboardPage() {
  const { user } = useAuth();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user?.uid],
    queryFn: () => fetchBookings(user!.uid),
    enabled: !!user,
  });

  const { data: userInvoices } = useInvoicesForUser(user?.uid);
  const unpaidInvoices = (userInvoices ?? []).filter((inv) => inv.status === "unpaid");
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const todayIso = new Date().toISOString().slice(0, 10);
  const activeBookings = (bookings ?? []).filter((b) => b.endDate >= todayIso);
  const pastBookings = (bookings ?? []).filter((b) => b.endDate < todayIso);

  return (
    <>
      <Section>
        <SectionHeader
          align="left"
          eyebrow="My Account"
          title={<>Welcome back{user?.displayName ? `, ${user.displayName}` : ""}</>}
          subtitle="Track your campaign bookings and their status below."
        />

        {unpaidInvoices.length > 0 && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
            <Receipt className="h-5 w-5 shrink-0 text-gold" />
            <p className="text-sm">
              You have <strong>{unpaidInvoices.length}</strong> unpaid invoice
              {unpaidInvoices.length > 1 ? "s" : ""} totaling{" "}
              <strong>{formatNaira(unpaidTotal)}</strong>.
            </p>
          </div>
        )}

        <div className="mt-10">
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="space-y-2 p-5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!bookings || bookings.length === 0) && (
            <div className="rounded-2xl border border-border bg-surface/40 p-10 text-center">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-4 font-display text-lg font-bold">No bookings yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse billboard locations and book your first campaign.
              </p>
              <Link
                to="/locations"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold"
              >
                Browse Locations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!isLoading && activeBookings.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Active Campaigns
              </h3>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {activeBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && pastBookings.length > 0 && (
            <div className={activeBookings.length > 0 ? "mt-12" : undefined}>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Past Campaigns
              </h3>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const s = BOOKING_STATUS_CLASSES[booking.status];
  const hasArtwork = (booking.artworkPaths?.length ?? 0) > 0;
  const { loaded, onLoad, imgRef } = useImageLoaded();
  const { data: invoices } = useInvoicesForBooking(booking.id);
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canSelfCancel = booking.status === "pending_payment" || booking.status === "under_review";
  const canRequestCancellation = booking.status === "confirmed";
  const cancellationRequested = booking.status === "cancellation_requested";

  const cancelMutation = useMutation({
    mutationFn: () =>
      canSelfCancel ? cancelBooking(booking.id) : requestBookingCancellation(booking.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", booking.userId] });
      toast.success(canSelfCancel ? "Booking cancelled." : "Cancellation requested.");
      setConfirmOpen(false);
    },
    onError: () => toast.error("Couldn't update this booking. Please try again."),
  });

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {booking.billboardSnapshot.image ? (
          <>
            {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
            <img
              ref={imgRef}
              src={booking.billboardSnapshot.image}
              alt={`${booking.billboardSnapshot.billboardType} in ${booking.billboardSnapshot.area}, ${booking.billboardSnapshot.city}`}
              onLoad={onLoad}
              className={`h-full w-full object-cover ${loaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${s.bg} ${s.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
        </span>
        {hasArtwork && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
            <Paperclip className="h-3 w-3" /> Artwork attached
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          {booking.billboardSnapshot.city}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold">{booking.billboardSnapshot.area}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {booking.startDate} – {booking.endDate}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" /> {booking.budget}
        </p>

        {hasArtwork && <ArtworkLinks paths={booking.artworkPaths} />}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            to="/locations/$id"
            params={{ id: booking.billboardId }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" /> View billboard
          </Link>
          {invoices && invoices.length > 0 && (
            <Link
              to="/invoices/$bookingId"
              params={{ bookingId: booking.id }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
            >
              <Receipt className="h-3.5 w-3.5" /> View Invoices ({invoices.length})
            </Link>
          )}
        </div>

        {cancellationRequested && (
          <p className="mt-3 text-xs text-muted-foreground">
            Cancellation requested — awaiting admin review.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/book/$id"
            params={{ id: booking.billboardId }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-gold/40 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Book Again
          </Link>
          {(canSelfCancel || canRequestCancellation) && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Ban className="h-3.5 w-3.5" />{" "}
              {canSelfCancel ? "Cancel Booking" : "Request Cancellation"}
            </button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {canSelfCancel ? "Cancel this booking?" : "Request cancellation?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {canSelfCancel
                ? "This booking hasn't been confirmed yet, so it can be cancelled right away. This can't be undone."
                : "This campaign is already confirmed, so our team will review your request and follow up before finalizing the cancellation."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Never mind</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending
                ? "Submitting…"
                : canSelfCancel
                  ? "Cancel Booking"
                  : "Request Cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

function ArtworkLinks({ paths }: { paths: string[] }) {
  const { data: files } = useArtworkUrls(paths);

  if (!files || files.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {files.map((f) => (
        <a
          key={f.path}
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-gold"
        >
          <Paperclip className="h-3 w-3 shrink-0" /> <span className="truncate">{f.name}</span>
        </a>
      ))}
    </div>
  );
}
