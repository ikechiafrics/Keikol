import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Section, SectionHeader } from "@/components";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { logAudit } from "@/lib/audit-log";
import { fetchBookingById } from "@/lib/bookings-data";
import { fetchBillboardById } from "@/lib/billboards-data";
import {
  useConfirmedWindows,
  getConfirmedRangesForBillboard,
  isDateInAnyConfirmedRange,
} from "@/lib/billboard-availability";
import { BUDGET_OPTIONS, GOAL_OPTIONS } from "@/lib/booking-options";
import { BILLBOARD_DURATIONS } from "@/data/billboards";

export const Route = createFileRoute("/_authed/admin/bookings/$id")({
  loader: async ({ params }) => {
    const booking = await fetchBookingById(params.id);
    const billboard = booking ? await fetchBillboardById(booking.billboardId) : null;
    return { booking, billboard };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.booking
          ? `Edit Booking — ${loaderData.booking.companyName || loaderData.booking.id} — Keikol`
          : "Edit Booking — Keikol",
      },
    ],
  }),
  component: AdminEditBookingPage,
});

const DURATION_OPTIONS: string[] = [...BILLBOARD_DURATIONS];

const editBookingSchema = z.object({
  budget: z.string().min(1, "Select a budget range"),
  goal: z.string().min(1, "Select a campaign goal"),
  duration: z.string().min(1, "Select a duration"),
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Enter a valid contact email"),
  contactPhone: z.string().min(1, "Phone number is required"),
  campaignDetails: z.string().min(1, "Tell us about the campaign"),
});
type EditBookingFormValues = z.infer<typeof editBookingSchema>;

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AdminEditBookingPage() {
  const { booking, billboard } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: windows } = useConfirmedWindows();

  const [range, setRange] = useState<DateRange | undefined>(
    booking
      ? {
          from: new Date(`${booking.startDate}T00:00:00`),
          to: new Date(`${booking.endDate}T00:00:00`),
        }
      : undefined,
  );
  const [submitting, setSubmitting] = useState(false);

  const bookedSet = useMemo(() => new Set(billboard?.bookedDates ?? []), [billboard]);

  // Exclude this booking's own confirmed window from the disabled-date set
  // — otherwise its own already-assigned dates would show as unavailable
  // when re-picking the same or an overlapping range. Every confirmed
  // booking's window uses that booking's exact original dates, so this
  // date-range match is a safe way to identify "this one" without needing
  // the window's document ID to be carried through the fetch.
  const confirmedRanges = useMemo(() => {
    if (!billboard || !booking) return [];
    const all = getConfirmedRangesForBillboard(billboard.id, windows ?? []);
    return all.filter((r) => !(r.startDate === booking.startDate && r.endDate === booking.endDate));
  }, [billboard, booking, windows]);

  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      budget: booking?.budget ?? "",
      goal: booking?.goal ?? "",
      duration: booking?.duration ?? "",
      companyName: booking?.companyName ?? "",
      contactEmail: booking?.contactEmail ?? "",
      contactPhone: booking?.contactPhone ?? "",
      campaignDetails: booking?.campaignDetails ?? "",
    },
  });

  if (!booking || !billboard) {
    return (
      <Section>
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface/40 p-10 text-center">
          <h1 className="font-display text-xl font-bold">Booking not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This booking may have been deleted, or its billboard no longer exists.
          </p>
          <Link
            to="/admin/bookings"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Link>
        </div>
      </Section>
    );
  }

  async function onSubmit(values: EditBookingFormValues) {
    if (!range?.from || !range?.to) {
      toast.error("Select a campaign date range.");
      return;
    }
    if (!user || !booking || !billboard) return;

    setSubmitting(true);
    try {
      const startDate = toISODate(range.from);
      const endDate = toISODate(range.to);
      const batch = writeBatch(db);

      batch.update(doc(db, "bookings", booking.id), {
        budget: values.budget,
        goal: values.goal,
        duration: values.duration,
        companyName: values.companyName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        campaignDetails: values.campaignDetails,
        startDate,
        endDate,
        updatedAt: serverTimestamp(),
      });

      // Keep the public availability mirror in sync if this booking is
      // confirmed and its dates changed — otherwise it'd keep showing the
      // old date range as booked.
      if (booking.status === "confirmed") {
        batch.set(doc(db, "publicBookingWindows", booking.id), {
          billboardId: billboard.id,
          startDate,
          endDate,
          status: "confirmed",
        });
      }

      logAudit(
        batch,
        { uid: user.uid, email: user.email },
        {
          action: "booking.edited",
          targetType: "booking",
          targetId: booking.id,
          summary: `Edited booking details for ${values.companyName || booking.id}`,
        },
      );

      await batch.commit();
      toast.success("Booking updated.");
      navigate({ to: "/admin/bookings" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong updating this booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Admin"
        title={
          <>
            Edit <span className="text-gradient-gold">Booking</span>
          </>
        }
        subtitle="Correct details on an existing booking — the billboard and status aren't changed here."
      />

      <Link
        to="/admin/bookings"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <div className="mt-6 rounded-2xl bg-card-premium p-5 shadow-elegant ring-hairline">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          {billboard.city}
        </p>
        <p className="font-display text-lg font-bold">{billboard.area}</p>
        <p className="text-sm text-muted-foreground">
          Billboard can't be changed here — cancel and create a new booking instead if it needs to
          move to a different one.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="mb-3 text-sm font-semibold">Campaign Dates</p>
          <div className="rounded-2xl bg-card-premium p-3 shadow-elegant ring-hairline">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
              excludeDisabled
              disabled={(date) =>
                date < new Date(new Date().toDateString()) ||
                bookedSet.has(toISODate(date)) ||
                isDateInAnyConfirmedRange(date, confirmedRanges)
              }
            />
          </div>
          {range?.from && range?.to && (
            <p className="mt-3 text-sm text-muted-foreground">
              {toISODate(range.from)} – {toISODate(range.to)}
            </p>
          )}
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline"
          >
            <SelectFormField
              control={form.control}
              name="budget"
              label="Campaign Budget"
              options={BUDGET_OPTIONS}
            />
            <SelectFormField
              control={form.control}
              name="goal"
              label="Campaign Goal"
              options={GOAL_OPTIONS}
            />
            <SelectFormField
              control={form.control}
              name="duration"
              label="Campaign Duration"
              options={DURATION_OPTIONS}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Company Name
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Contact Email
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      type="email"
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaignDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Campaign Details
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Saving…" : "Save Changes"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </Form>
      </div>
    </Section>
  );
}

function SelectFormField({
  control,
  name,
  label,
  options,
}: {
  control: ReturnType<typeof useForm<EditBookingFormValues>>["control"];
  name: keyof EditBookingFormValues;
  label: string;
  options: string[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <select
              {...field}
              className="w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
