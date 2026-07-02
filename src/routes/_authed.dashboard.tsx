import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { ArrowRight, Calendar, ImageOff, MapPin, Paperclip, Wallet } from "lucide-react";

import { Section, SectionHeader } from "@/components";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import type { StatusBadgeClasses } from "@/lib/status-badge";
import type { BookingStatus } from "@/lib/booking-status";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({
    meta: [{ title: "My Dashboard — Keikol" }],
  }),
  component: DashboardPage,
});

interface BillboardSnapshot {
  city: string;
  area: string;
  billboardType: string;
  size: string;
  priceRange: string;
  image?: string;
}

interface Booking {
  id: string;
  billboardId: string;
  billboardSnapshot: BillboardSnapshot;
  startDate: string;
  endDate: string;
  budget: string;
  status: BookingStatus;
  artworkPaths: string[];
  createdAt: Timestamp | null;
}

const BOOKING_STATUS_CLASSES: Record<Booking["status"], StatusBadgeClasses> = {
  pending_payment: { dot: "bg-gold", text: "text-gold", bg: "bg-gold/20", label: "Pending Payment" },
  under_review: { dot: "bg-electric-soft", text: "text-electric-soft", bg: "bg-electric/15", label: "Under Review" },
  confirmed: { dot: "bg-accent", text: "text-accent", bg: "bg-accent/20", label: "Confirmed" },
  cancelled: { dot: "bg-muted-foreground", text: "text-muted-foreground", bg: "bg-muted/20", label: "Cancelled" },
};

async function fetchBookings(uid: string): Promise<Booking[]> {
  const q = query(collection(db, "bookings"), where("userId", "==", uid), orderBy("createdAt", "desc"));
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

  return (
    <>
      <Section>
        <SectionHeader
          align="left"
          eyebrow="My Account"
          title={<>Welcome back{user?.displayName ? `, ${user.displayName}` : ""}</>}
          subtitle="Track your campaign bookings and their status below."
        />

        <div className="mt-10">
          {isLoading && <p className="text-sm text-muted-foreground">Loading your bookings…</p>}

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

          {!isLoading && bookings && bookings.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
              ))}
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

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {booking.billboardSnapshot.image ? (
          <img
            src={booking.billboardSnapshot.image}
            alt={`${booking.billboardSnapshot.billboardType} in ${booking.billboardSnapshot.area}, ${booking.billboardSnapshot.city}`}
            className="h-full w-full object-cover"
          />
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
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">{booking.billboardSnapshot.city}</p>
        <h3 className="mt-1 font-display text-lg font-bold">{booking.billboardSnapshot.area}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" /> {booking.startDate} – {booking.endDate}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" /> {booking.budget}
        </p>
        <Link
          to="/locations/$id"
          params={{ id: booking.billboardId }}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
        >
          <MapPin className="h-3.5 w-3.5" /> View billboard
        </Link>
      </div>
    </article>
  );
}
