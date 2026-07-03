import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

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
import { useBillboards } from "@/lib/billboards-data";
import {
  useConfirmedWindows,
  getConfirmedRangesForBillboard,
  isDateInAnyConfirmedRange,
} from "@/lib/billboard-availability";
import { getRatesSummary } from "@/lib/billboard-rates";
import { BUDGET_OPTIONS, GOAL_OPTIONS } from "@/lib/booking-options";
import { BOOKING_STATUS_CLASSES } from "@/lib/booking-types";
import { BILLBOARD_DURATIONS } from "@/data/billboards";
import type { BookingStatus } from "@/lib/booking-status";

export const Route = createFileRoute("/_authed/admin/bookings/new")({
  head: () => ({
    meta: [{ title: "Admin — Create Booking — Keikol" }],
  }),
  component: AdminCreateBookingPage,
});

const DURATION_OPTIONS: string[] = [...BILLBOARD_DURATIONS];
const STATUS_OPTIONS: BookingStatus[] = [
  "pending_payment",
  "under_review",
  "confirmed",
  "cancelled",
];

const adminBookingSchema = z.object({
  billboardId: z.string().min(1, "Select a billboard"),
  budget: z.string().min(1, "Select a budget range"),
  goal: z.string().min(1, "Select a campaign goal"),
  duration: z.string().min(1, "Select a duration"),
  companyName: z.string().min(1, "Company name is required"),
  contactEmail: z.string().email("Enter a valid contact email"),
  contactPhone: z.string().min(1, "Phone number is required"),
  campaignDetails: z.string().min(1, "Tell us about the campaign"),
  status: z.enum(["pending_payment", "under_review", "confirmed", "cancelled"] as [
    BookingStatus,
    ...BookingStatus[],
  ]),
});
type AdminBookingFormValues = z.infer<typeof adminBookingSchema>;

interface ResolvedCustomer {
  uid: string;
  email: string;
  displayName?: string;
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function AdminCreateBookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: billboards } = useBillboards();
  const { data: windows } = useConfirmedWindows();

  const [customerEmailInput, setCustomerEmailInput] = useState("");
  const [resolvedCustomer, setResolvedCustomer] = useState<ResolvedCustomer | null>(null);
  const [searching, setSearching] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdminBookingFormValues>({
    resolver: zodResolver(adminBookingSchema),
    defaultValues: {
      billboardId: "",
      budget: "",
      goal: "",
      duration: "",
      companyName: "",
      contactEmail: "",
      contactPhone: "",
      campaignDetails: "",
      status: "confirmed",
    },
  });

  const billboardId = form.watch("billboardId");
  const billboard = useMemo(
    () => (billboards ?? []).find((b) => b.id === billboardId) ?? null,
    [billboards, billboardId],
  );
  const bookedSet = useMemo(() => new Set(billboard?.bookedDates ?? []), [billboard]);
  const confirmedRanges = useMemo(
    () => (billboard ? getConfirmedRangesForBillboard(billboard.id, windows ?? []) : []),
    [billboard, windows],
  );

  async function searchCustomer() {
    const email = customerEmailInput.trim();
    if (!email) return;
    setSearching(true);
    setResolvedCustomer(null);
    try {
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", email)));
      if (snap.empty) {
        toast.error("No account found with that email. Ask the customer to sign up first.");
        return;
      }
      const customerDoc = snap.docs[0];
      const data = customerDoc.data() as { email: string; displayName?: string };
      setResolvedCustomer({
        uid: customerDoc.id,
        email: data.email,
        displayName: data.displayName,
      });
      form.setValue("contactEmail", data.email);
    } catch {
      toast.error("Couldn't look up that customer. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function onSubmit(values: AdminBookingFormValues) {
    if (!resolvedCustomer) {
      toast.error("Look up and select a customer first.");
      return;
    }
    if (!range?.from || !range?.to) {
      toast.error("Select a campaign date range.");
      return;
    }
    if (!billboard) {
      toast.error("Select a billboard.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const bookingRef = doc(collection(db, "bookings"));
      const batch = writeBatch(db);

      batch.set(bookingRef, {
        userId: resolvedCustomer.uid,
        billboardId: billboard.id,
        billboardSnapshot: {
          city: billboard.city,
          area: billboard.area,
          billboardType: billboard.billboardType,
          size: billboard.size,
          priceRange: getRatesSummary(billboard.rates),
          image: billboard.image,
        },
        startDate: toISODate(range.from),
        endDate: toISODate(range.to),
        budget: values.budget,
        goal: values.goal,
        duration: values.duration,
        companyName: values.companyName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        campaignDetails: values.campaignDetails,
        artworkPaths: [],
        status: values.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (values.status === "confirmed") {
        batch.set(doc(db, "publicBookingWindows", bookingRef.id), {
          billboardId: billboard.id,
          startDate: toISODate(range.from),
          endDate: toISODate(range.to),
          status: "confirmed",
        });
      }

      logAudit(
        batch,
        { uid: user.uid, email: user.email },
        {
          action: "booking.created_by_admin",
          targetType: "booking",
          targetId: bookingRef.id,
          summary: `Created booking for ${resolvedCustomer.email} on ${billboard.area}, ${billboard.city}`,
        },
      );

      await batch.commit();
      toast.success("Booking created.");
      navigate({ to: "/admin/bookings" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong creating this booking. Please try again.");
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
            Create <span className="text-gradient-gold">Booking</span>
          </>
        }
        subtitle="Record a booking on behalf of a customer — e.g. one made over the phone."
      />

      <Link
        to="/admin/bookings"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </Link>

      <div className="mt-6 max-w-lg rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Customer
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={customerEmailInput}
            onChange={(e) => setCustomerEmailInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchCustomer();
              }
            }}
            placeholder="customer@email.com"
            className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <button
            type="button"
            onClick={searchCustomer}
            disabled={searching}
            className="flex-none inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm font-semibold hover:border-gold hover:text-gold disabled:opacity-60"
          >
            <Search className="h-4 w-4" /> {searching ? "Searching…" : "Find"}
          </button>
        </div>
        <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
          The customer must already have a Keikol account — bookings need a real account so they
          show up on that customer's dashboard.
        </p>
        {resolvedCustomer && (
          <p className="mt-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2.5 text-sm">
            Found: <strong>{resolvedCustomer.displayName || resolvedCustomer.email}</strong> (
            {resolvedCustomer.email})
          </p>
        )}
      </div>

      {resolvedCustomer && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Billboard
            </label>
            <select
              value={billboardId}
              onChange={(e) => {
                form.setValue("billboardId", e.target.value);
                setRange(undefined);
              }}
              className="w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="">Select a billboard...</option>
              {(billboards ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.city} — {b.area}
                </option>
              ))}
            </select>
            {form.formState.errors.billboardId && (
              <p className="mt-1.5 text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.billboardId.message}
              </p>
            )}

            {billboard && (
              <>
                <p className="mb-3 mt-6 text-sm font-semibold">Campaign Dates</p>
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
              </>
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
                        placeholder="Company / brand"
                        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
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
                        placeholder="contact@brand.com"
                        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
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
                        placeholder="+234 ..."
                        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
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
                        placeholder="Notes about the campaign..."
                        className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SelectFormField
                control={form.control}
                name="status"
                label="Status"
                options={STATUS_OPTIONS}
                optionLabel={(s) => BOOKING_STATUS_CLASSES[s as BookingStatus].label ?? s}
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting ? "Creating…" : "Create Booking"} <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-[11px] text-muted-foreground">
                No artwork is collected here — the customer can still be asked to send it directly.
              </p>
            </form>
          </Form>
        </div>
      )}
    </Section>
  );
}

function SelectFormField({
  control,
  name,
  label,
  options,
  optionLabel,
}: {
  control: ReturnType<typeof useForm<AdminBookingFormValues>>["control"];
  name: keyof AdminBookingFormValues;
  label: string;
  options: string[];
  optionLabel?: (value: string) => string;
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
              {!field.value && (
                <option value="" disabled>
                  Select...
                </option>
              )}
              {options.map((o) => (
                <option key={o} value={o}>
                  {optionLabel ? optionLabel(o) : o}
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
