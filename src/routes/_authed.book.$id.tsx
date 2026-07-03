import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";

import { Section, SectionHeader, SelectedBillboardSummary } from "@/components";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { db, storage, artworkStoragePath } from "@/lib/firebase";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/lib/auth-context";
import type { BookingStatus } from "@/lib/booking-status";
import {
  useConfirmedWindows,
  getConfirmedRangesForBillboard,
  isDateInAnyConfirmedRange,
} from "@/lib/billboard-availability";
import { fetchBillboardById } from "@/lib/billboards-data";

export const Route = createFileRoute("/_authed/book/$id")({
  loader: async ({ params }) => ({ billboard: await fetchBillboardById(params.id) }),
  head: ({ loaderData }) => {
    const b = loaderData?.billboard ?? null;
    return { meta: [{ title: b ? `Book ${b.area} — Keikol` : "Book a Billboard — Keikol" }] };
  },
  component: BookBillboardPage,
});

const BUDGET_OPTIONS = ["Below ₦500,000", "₦500,000 – ₦1,000,000", "₦1,000,000 – ₦2,000,000", "₦2,000,000+"];
const GOAL_OPTIONS = ["Brand Awareness", "Product Launch", "Event Promotion", "Store/Branch Launch", "Political/Public Awareness"];
const DURATION_OPTIONS = ["1 Week", "2 Weeks", "1 Month", "3 Months"];

const bookingSchema = z.object({
  budget: z.string().min(1, "Select a budget range"),
  goal: z.string().min(1, "Select a campaign goal"),
  duration: z.string().min(1, "Select a duration"),
  companyName: z.string().min(1, "Company name is required"),
  contactPhone: z.string().min(1, "Phone number is required"),
  campaignDetails: z.string().min(1, "Tell us about your campaign"),
});
type BookingFormValues = z.infer<typeof bookingSchema>;

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function BookBillboardPage() {
  const { billboard } = Route.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [range, setRange] = useState<DateRange | undefined>();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bookedSet = useMemo(() => new Set(billboard?.bookedDates ?? []), [billboard]);
  const { data: windows } = useConfirmedWindows();
  const confirmedRanges = useMemo(
    () => (billboard ? getConfirmedRangesForBillboard(billboard.id, windows ?? []) : []),
    [billboard, windows],
  );

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { budget: "", goal: "", duration: "", companyName: "", contactPhone: "", campaignDetails: "" },
  });

  if (!billboard) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl font-extrabold">Billboard Not Found</h1>
        <p className="mt-4 text-muted-foreground">This billboard listing may have been moved or is no longer available.</p>
        <Link to="/locations" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-gold">
          <ArrowLeft className="h-4 w-4" /> Back to Locations
        </Link>
      </div>
    );
  }

  const bb = billboard;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > 20 * 1024 * 1024) {
      setFileError("File must be under 20MB.");
      setFile(null);
      return;
    }
    if (f && !/^image\/|^application\/pdf$/.test(f.type)) {
      setFileError("Only images or PDF files are accepted.");
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(f);
  }

  async function onSubmit(values: BookingFormValues) {
    if (!range?.from || !range?.to) {
      toast.error("Please select a campaign date range.");
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const bookingRef = doc(collection(db, "bookings"));
      const artworkPaths: string[] = [];

      if (file) {
        const path = artworkStoragePath(user.uid, bookingRef.id, file.name);
        const storageRef = ref(storage, path);
        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file);
          task.on(
            "state_changed",
            (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            () => resolve(),
          );
        });
        artworkPaths.push(path);
      }

      const status: BookingStatus = "pending_payment";
      await setDoc(bookingRef, {
        userId: user.uid,
        billboardId: bb.id,
        billboardSnapshot: {
          city: bb.city,
          area: bb.area,
          billboardType: bb.billboardType,
          size: bb.size,
          priceRange: bb.priceRange,
          image: bb.image,
        },
        startDate: toISODate(range.from),
        endDate: toISODate(range.to),
        budget: values.budget,
        goal: values.goal,
        duration: values.duration,
        companyName: values.companyName,
        contactEmail: user.email ?? "",
        contactPhone: values.contactPhone,
        campaignDetails: values.campaignDetails,
        artworkPaths,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      trackEvent("booking_submitted", { billboard_id: bb.id });
      toast.success("Booking submitted! We'll be in touch to confirm payment.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong submitting your booking. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }

  return (
    <Section>
      <SectionHeader
        align="left"
        eyebrow="Book This Billboard"
        title={<>Complete your <span className="text-gradient-gold">booking request.</span></>}
      />

      <SelectedBillboardSummary billboard={billboard} className="mt-8 mb-8" />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="mb-3 text-sm font-semibold">Campaign Dates</p>
          <div className="rounded-2xl bg-card-premium p-3 shadow-elegant ring-hairline">
            <Calendar
              mode="range"
              selected={range}
              onSelect={setRange}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline">
            <SelectFormField control={form.control} name="budget" label="Campaign Budget" options={BUDGET_OPTIONS} />
            <SelectFormField control={form.control} name="goal" label="Campaign Goal" options={GOAL_OPTIONS} />
            <SelectFormField control={form.control} name="duration" label="Campaign Duration" options={DURATION_OPTIONS} />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company Name</FormLabel>
                  <FormControl>
                    <input {...field} placeholder="Company / brand" className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
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
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel>
                  <FormControl>
                    <input {...field} placeholder="+234 ..." className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
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
                  <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Campaign Details</FormLabel>
                  <FormControl>
                    <textarea {...field} rows={4} placeholder="Tell us about your campaign goals..." className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Campaign Artwork (optional)
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground hover:border-gold hover:text-gold">
                <Upload className="h-4 w-4" />
                {file ? file.name : "Upload image or PDF (max 20MB)"}
                <input type="file" accept="image/*,application/pdf" onChange={onFileChange} className="hidden" />
              </label>
              {fileError && <p className="mt-1.5 text-[0.8rem] font-medium text-destructive">{fileError}</p>}
              {uploadProgress !== null && (
                <div className="mt-3">
                  <Progress value={uploadProgress} />
                  <p className="mt-1 text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? "Submitting…" : "Submit Booking Request"} <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Your booking will be marked pending payment. The Keikol team will follow up to confirm and process payment.
            </p>
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
  control: ReturnType<typeof useForm<BookingFormValues>>["control"];
  name: keyof BookingFormValues;
  label: string;
  options: string[];
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</FormLabel>
          <FormControl>
            <select
              {...field}
              className="w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="" disabled>Select...</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
