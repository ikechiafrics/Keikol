import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon, ChevronRight, Upload, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { db, storage, billboardStoragePath } from "@/lib/firebase";
import { useBillboards } from "@/lib/billboards-data";
import { parseAmount, formatAmountInput } from "@/lib/currency-input";
import {
  BILLBOARD_TYPES,
  AVAILABILITIES,
  BILLBOARD_DURATIONS,
  type Billboard,
  type BillboardType,
  type Availability,
  type BillboardDuration,
} from "@/data/billboards";

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const LIGHTING_OPTIONS = ["Illuminated", "Non-illuminated"] as const;

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const billboardFormSchema = z.object({
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  landmark: z.string().min(1, "Landmark is required"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  billboardType: z.enum(
    BILLBOARD_TYPES.filter((t) => t !== "All") as [BillboardType, ...BillboardType[]],
  ),
  size: z.string().min(1, "Size is required"),
  estimatedDailyImpressions: z.string().min(1, "Required"),
  availability: z.enum(
    AVAILABILITIES.filter((a) => a !== "All") as [Availability, ...Availability[]],
  ),
  lighting: z.string().min(1, "Required"),
  description: z.string().min(1, "Description is required"),
  recommendedIndustries: z.string(),
  bestFor: z.string(),
  nearbyLandmarks: z.string(),
  tags: z.string(),
  bookedDates: z.array(z.string()),
});
type BillboardFormValues = z.infer<typeof billboardFormSchema>;

function toCommaString(items: string[]): string {
  return items.join(", ");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BillboardForm({
  mode,
  initialValues,
  billboardId,
}: {
  mode: "create" | "edit";
  initialValues?: Billboard;
  billboardId?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingBillboards } = useBillboards();
  const cityOptions = Array.from(
    new Set((existingBillboards ?? []).map((b) => b.city).filter(Boolean)),
  ).sort();
  const areaOptions = Array.from(
    new Set((existingBillboards ?? []).map((b) => b.area).filter(Boolean)),
  ).sort();

  const [slug, setSlug] = useState(billboardId ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryProgress, setPrimaryProgress] = useState<number | null>(null);
  const [existingImage, setExistingImage] = useState(initialValues?.image ?? "");

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [existingGallery, setExistingGallery] = useState<string[]>(initialValues?.gallery ?? []);

  const [rates, setRates] = useState<Partial<Record<BillboardDuration, number>>>(
    initialValues?.rates ?? {},
  );

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(billboardFormSchema),
    defaultValues: {
      city: initialValues?.city ?? "",
      area: initialValues?.area ?? "",
      landmark: initialValues?.landmark ?? "",
      lat: initialValues?.lat ?? 0,
      lng: initialValues?.lng ?? 0,
      billboardType: initialValues?.billboardType ?? "Digital Billboard",
      size: initialValues?.size ?? "",
      estimatedDailyImpressions: initialValues?.estimatedDailyImpressions ?? "",
      availability: initialValues?.availability ?? "Available",
      lighting: initialValues?.lighting ?? "Illuminated",
      description: initialValues?.description ?? "",
      recommendedIndustries: toCommaString(initialValues?.recommendedIndustries ?? []),
      bestFor: toCommaString(initialValues?.bestFor ?? []),
      nearbyLandmarks: toCommaString(initialValues?.nearbyLandmarks ?? []),
      tags: toCommaString(initialValues?.tags ?? []),
      bookedDates: initialValues?.bookedDates ?? [],
    },
  });

  const city = form.watch("city");
  const area = form.watch("area");
  useEffect(() => {
    if (mode !== "create" || slugEdited) return;
    setSlug(slugify(`${city} ${area}`));
  }, [mode, slugEdited, city, area]);

  function onPrimaryFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.type.startsWith("image/")) {
      toast.error("Primary image must be an image file.");
      return;
    }
    setPrimaryFile(f);
  }

  function onGalleryFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.some((f) => !f.type.startsWith("image/"))) {
      toast.error("Gallery uploads must be image files.");
      return;
    }
    setGalleryFiles((prev) => [...prev, ...files]);
  }

  function removeExistingGalleryUrl(url: string) {
    setExistingGallery((prev) => prev.filter((u) => u !== url));
  }

  async function uploadImage(id: string, file: File): Promise<string> {
    const path = billboardStoragePath(id, `${Date.now()}-${file.name}`);
    const storageRef = ref(storage, path);
    await new Promise<void>((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        (snap) => setPrimaryProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        () => resolve(),
      );
    });
    return getDownloadURL(storageRef);
  }

  const mutation = useMutation({
    mutationFn: async (values: BillboardFormValues) => {
      const id = mode === "create" ? slug : billboardId!;
      if (!id) throw new Error("A Billboard ID is required.");

      let image = existingImage;
      if (primaryFile) {
        image = await uploadImage(id, primaryFile);
        setPrimaryProgress(null);
      }

      let gallery = existingGallery;
      if (galleryFiles.length > 0) {
        setGalleryUploading(true);
        try {
          const uploaded = await Promise.all(
            galleryFiles.map(async (f): Promise<string> => {
              const path = billboardStoragePath(id, `${Date.now()}-${f.name}`);
              const storageRef = ref(storage, path);
              await uploadBytesResumable(storageRef, f);
              return getDownloadURL(storageRef);
            }),
          );
          gallery = [...existingGallery, ...uploaded];
        } finally {
          setGalleryUploading(false);
        }
      }

      const data = {
        city: values.city,
        area: values.area,
        landmark: values.landmark,
        lat: values.lat,
        lng: values.lng,
        billboardType: values.billboardType,
        size: values.size,
        estimatedDailyImpressions: values.estimatedDailyImpressions,
        availability: values.availability,
        rates,
        lighting: values.lighting,
        description: values.description,
        recommendedIndustries: parseList(values.recommendedIndustries),
        bestFor: parseList(values.bestFor),
        nearbyLandmarks: parseList(values.nearbyLandmarks),
        tags: parseList(values.tags),
        bookedDates: values.bookedDates,
        image,
        gallery,
        updatedAt: serverTimestamp(),
      };

      if (mode === "create") {
        await setDoc(doc(db, "billboards", id), { ...data, createdAt: serverTimestamp() });
      } else {
        await updateDoc(doc(db, "billboards", id), data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-billboards"] });
      queryClient.invalidateQueries({ queryKey: ["billboards"] });
      if (billboardId) queryClient.invalidateQueries({ queryKey: ["billboard", billboardId] });
      toast.success(mode === "create" ? "Billboard created." : "Billboard updated.");
      navigate({ to: "/admin/billboards" });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Couldn't save this billboard. Please try again.",
      );
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4 rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline"
      >
        {mode === "create" && (
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-gold">
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${advancedOpen ? "rotate-90" : ""}`}
              />
              Advanced: Billboard ID / Slug
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <input
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugEdited(true);
                }}
                placeholder="e.g. lagos-lekki-expressway"
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
                Used in the URL — auto-suggested from city/area, editable.
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <ComboField
            control={form.control}
            name="city"
            label="City"
            options={cityOptions}
            hint="Pick an existing city to keep listings consistent, or type a new one."
          />
          <ComboField
            control={form.control}
            name="area"
            label="Area"
            options={areaOptions}
            hint="The neighborhood/district, e.g. 'Lekki Phase 1'."
          />
        </div>
        <TextField
          control={form.control}
          name="landmark"
          label="Location Description"
          placeholder="e.g. Along Lekki-Epe Expressway, opposite Circle Mall"
          hint="A short description of exactly where this billboard is — shown right under the city/area on cards and the detail page."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="lat"
            label="Latitude"
            type="number"
            step="any"
            hint="From the billboard's location on Google Maps."
          />
          <TextField
            control={form.control}
            name="lng"
            label="Longitude"
            type="number"
            step="any"
            hint="From the billboard's location on Google Maps."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="billboardType"
            label="Billboard Type"
            options={BILLBOARD_TYPES.filter((t) => t !== "All")}
          />
          <SelectField
            control={form.control}
            name="availability"
            label="Availability"
            options={AVAILABILITIES.filter((a) => a !== "All")}
          />
        </div>

        <SizeField control={form.control} defaultSize={initialValues?.size ?? ""} />
        <TextField
          control={form.control}
          name="estimatedDailyImpressions"
          label="Estimated Daily Impressions"
          placeholder="e.g. 85,000"
          hint="Rough number of people/vehicles passing this billboard per day."
        />

        <RatesField rates={rates} onChange={setRates} />

        <SelectField
          control={form.control}
          name="lighting"
          label="Lighting"
          options={LIGHTING_OPTIONS}
        />
        <TextAreaField
          control={form.control}
          name="description"
          label="Description"
          hint="The main write-up shown on the billboard's detail page."
        />
        <TextField
          control={form.control}
          name="recommendedIndustries"
          label="Recommended Industries (comma-separated)"
          placeholder="e.g. Real Estate, Banking, Telecom"
          hint="Which types of brands this billboard suits best."
        />
        <TextField
          control={form.control}
          name="bestFor"
          label="Best For (comma-separated)"
          placeholder="e.g. Brand Awareness, Product Launch"
          hint="Which campaign goals this billboard suits best."
        />
        <TextField
          control={form.control}
          name="nearbyLandmarks"
          label="Nearby Landmarks (comma-separated)"
          placeholder="e.g. Circle Mall, Lekki Toll Gate"
          hint="Well-known places near the billboard — shown as tags on the detail page. Different from the Location Description above."
        />
        <TextField
          control={form.control}
          name="tags"
          label="Tags (comma-separated)"
          placeholder="e.g. High Traffic, Premium"
          hint="Short labels used for search and filtering."
        />
        <BookedDatesField control={form.control} />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Primary Image
          </label>
          {existingImage && !primaryFile && (
            <img
              src={existingImage}
              alt="Current billboard"
              className="mb-2 h-32 w-full rounded-lg object-cover"
            />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground hover:border-gold hover:text-gold">
            <Upload className="h-4 w-4" />
            {primaryFile
              ? primaryFile.name
              : existingImage
                ? "Replace image"
                : "Upload primary image"}
            <input type="file" accept="image/*" onChange={onPrimaryFileChange} className="hidden" />
          </label>
          {primaryProgress !== null && (
            <div className="mt-3">
              <Progress value={primaryProgress} />
              <p className="mt-1 text-xs text-muted-foreground">Uploading… {primaryProgress}%</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gallery
          </label>
          {existingGallery.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {existingGallery.map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img src={url} alt="Gallery" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingGalleryUrl(url)}
                    className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-background/90 text-foreground"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground hover:border-gold hover:text-gold">
            <Upload className="h-4 w-4" />
            {galleryFiles.length > 0
              ? `${galleryFiles.length} new image(s) selected`
              : "Add gallery images"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onGalleryFilesChange}
              className="hidden"
            />
          </label>
          {galleryUploading && (
            <p className="mt-2 text-xs text-muted-foreground">Uploading gallery images…</p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {mutation.isPending ? "Saving…" : mode === "create" ? "Create Billboard" : "Save Changes"}
        </button>
      </form>
    </Form>
  );
}

function TextField({
  control,
  name,
  label,
  type = "text",
  step,
  hint,
  placeholder,
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  name: keyof BillboardFormValues;
  label: string;
  type?: string;
  step?: string;
  hint?: string;
  placeholder?: string;
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
            <input
              {...field}
              type={type}
              step={step}
              placeholder={placeholder}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </FormControl>
          {hint && <p className="text-[0.8rem] text-muted-foreground">{hint}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const SIZE_REGEX = /^(\d+(?:\.\d+)?)\s*(ft|m)\s*x\s*(\d+(?:\.\d+)?)\s*(ft|m)$/i;

function parseSize(size: string): { width: string; height: string; unit: "ft" | "m" } {
  const match = SIZE_REGEX.exec(size.trim());
  if (!match) return { width: "", height: "", unit: "ft" };
  const [, width, unit, height] = match;
  return { width, height, unit: unit.toLowerCase() as "ft" | "m" };
}

// One optional price per campaign duration, replacing the old free-text
// "Price Range"/"Price Tier" fields — both display strings are now derived
// from this table (see src/lib/billboard-rates.ts) instead of typed twice.
function RatesField({
  rates,
  onChange,
}: {
  rates: Partial<Record<BillboardDuration, number>>;
  onChange: (rates: Partial<Record<BillboardDuration, number>>) => void;
}) {
  function updateRate(duration: BillboardDuration, input: string) {
    const amount = parseAmount(input);
    const next = { ...rates };
    if (amount > 0) {
      next[duration] = amount;
    } else {
      delete next[duration];
    }
    onChange(next);
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Rates
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {BILLBOARD_DURATIONS.map((duration) => (
          <div key={duration} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-sm text-muted-foreground">{duration}</span>
            <input
              type="text"
              inputMode="numeric"
              value={rates[duration] ? formatAmountInput(String(rates[duration])) : ""}
              onChange={(e) => updateRate(duration, e.target.value)}
              placeholder="₦ Amount"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
        Leave a duration blank if this billboard isn't offered at that length. The card and detail
        page prices are generated automatically from whichever rates are filled in here.
      </p>
    </div>
  );
}

// Width/height/unit inputs that compose into the stored "size" string, so
// admins fill in plain numbers instead of remembering a text format like
// "48ft x 14ft". Falls back to blank fields (rather than guessing) if an
// existing billboard's size string doesn't match that pattern.
function SizeField({
  control,
  defaultSize,
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  defaultSize: string;
}) {
  const initial = parseSize(defaultSize);
  const [width, setWidth] = useState(initial.width);
  const [height, setHeight] = useState(initial.height);
  const [unit, setUnit] = useState<"ft" | "m">(initial.unit);

  return (
    <FormField
      control={control}
      name="size"
      render={({ field }) => {
        function update(nextWidth: string, nextHeight: string, nextUnit: "ft" | "m") {
          setWidth(nextWidth);
          setHeight(nextHeight);
          setUnit(nextUnit);
          field.onChange(
            nextWidth && nextHeight ? `${nextWidth}${nextUnit} x ${nextHeight}${nextUnit}` : "",
          );
        }

        return (
          <FormItem>
            <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Size
            </FormLabel>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="any"
                value={width}
                onChange={(e) => update(e.target.value, height, unit)}
                placeholder="Width"
                className="w-full min-w-0 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <span className="shrink-0 text-muted-foreground">x</span>
              <input
                type="number"
                min="0"
                step="any"
                value={height}
                onChange={(e) => update(width, e.target.value, unit)}
                placeholder="Height"
                className="w-full min-w-0 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <select
                value={unit}
                onChange={(e) => update(width, height, e.target.value as "ft" | "m")}
                className="shrink-0 appearance-none rounded-xl border border-border bg-background/60 px-3 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                <option value="ft">ft</option>
                <option value="m">m</option>
              </select>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              Physical dimensions of the billboard face.
            </p>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Free-text input with a native <datalist> of already-used values, so admins
// can pick an existing city/area to keep inventory consistent, or type a
// genuinely new one — no fixed/curated list to fall out of date.
function ComboField({
  control,
  name,
  label,
  options,
  hint,
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  name: keyof BillboardFormValues;
  label: string;
  options: string[];
  hint?: string;
}) {
  const listId = `datalist-${name}`;
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
            <input
              {...field}
              list={listId}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </FormControl>
          <datalist id={listId}>
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
          {hint && <p className="text-[0.8rem] text-muted-foreground">{hint}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TextAreaField({
  control,
  name,
  label,
  hint,
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  name: keyof BillboardFormValues;
  label: string;
  hint?: string;
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
            <textarea
              {...field}
              rows={4}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </FormControl>
          {hint && <p className="text-[0.8rem] text-muted-foreground">{hint}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function SelectField({
  control,
  name,
  label,
  options,
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  name: keyof BillboardFormValues;
  label: string;
  options: readonly string[];
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

// Every ISO date from "from" through "to" inclusive, so picking a range's
// two endpoints blocks the whole period in one interaction instead of
// clicking every individual day.
function expandDateRange(from: Date, to: Date): string[] {
  const dates: string[] = [];
  const cur = new Date(from);
  while (cur <= to) {
    dates.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function BookedDatesField({
  control,
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
}) {
  const [pickingRange, setPickingRange] = useState<DateRange | undefined>();

  return (
    <FormField
      control={control}
      name="bookedDates"
      render={({ field }) => {
        const dates: string[] = field.value ?? [];

        function handleRangeSelect(range: DateRange | undefined, triggerDate: Date) {
          // With min={1} below, clicking the pending start day again clears
          // the range (react-day-picker's normal behavior for a non-zero
          // min) instead of completing it — treat that specifically as
          // "block just this one day" rather than losing the selection.
          if (!range && pickingRange?.from && !pickingRange?.to) {
            if (toISODate(pickingRange.from) === toISODate(triggerDate)) {
              field.onChange(Array.from(new Set([...dates, toISODate(triggerDate)])).sort());
            }
            setPickingRange(undefined);
            return;
          }

          setPickingRange(range);
          if (range?.from && range?.to) {
            const merged = Array.from(
              new Set([...dates, ...expandDateRange(range.from, range.to)]),
            ).sort();
            field.onChange(merged);
            setPickingRange(undefined);
          }
        }

        return (
          <FormItem>
            <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Booked Dates
            </FormLabel>
            <p className="text-[0.8rem] text-muted-foreground">
              Manually block specific dates or a whole period on top of real confirmed bookings —
              e.g. for maintenance or a booking made outside the app.
            </p>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 text-sm hover:border-gold focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                  >
                    <span className={dates.length ? "" : "text-muted-foreground/70"}>
                      {dates.length > 0
                        ? `${dates.length} date(s) blocked`
                        : "Select dates to block"}
                    </span>
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    min={1}
                    selected={pickingRange}
                    onSelect={handleRangeSelect}
                    modifiers={{ blocked: dates.map((d) => new Date(`${d}T00:00:00`)) }}
                    modifiersClassNames={{ blocked: "bg-gold text-primary-foreground rounded-md" }}
                  />
                  <p className="border-t border-border px-4 py-2.5 text-[0.7rem] text-muted-foreground">
                    Gold days are already blocked. Click a start and end date to block a new period,
                    or the same day twice for a single date.
                  </p>
                </PopoverContent>
              </Popover>
            </FormControl>
            {dates.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs text-muted-foreground"
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => field.onChange(dates.filter((x) => x !== d))}
                        aria-label={`Remove ${d}`}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => field.onChange([])}
                  className="text-xs font-semibold text-destructive hover:underline"
                >
                  Clear all blocked dates
                </button>
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
