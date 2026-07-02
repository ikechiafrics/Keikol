import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { db, storage, billboardStoragePath } from "@/lib/firebase";
import {
  BILLBOARD_TYPES,
  AVAILABILITIES,
  type Billboard,
  type BillboardType,
  type Availability,
} from "@/data/billboards";

const DATE_LIST_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
  billboardType: z.enum(BILLBOARD_TYPES.filter((t) => t !== "All") as [BillboardType, ...BillboardType[]]),
  size: z.string().min(1, "Size is required"),
  estimatedDailyImpressions: z.string().min(1, "Required"),
  availability: z.enum(AVAILABILITIES.filter((a) => a !== "All") as [Availability, ...Availability[]]),
  priceRange: z.string().min(1, "Required"),
  priceTier: z.string().min(1, "Required"),
  lighting: z.string().min(1, "Required"),
  description: z.string().min(1, "Description is required"),
  recommendedIndustries: z.string(),
  bestFor: z.string(),
  nearbyLandmarks: z.string(),
  tags: z.string(),
  bookedDates: z.string().refine(
    (v) => parseList(v).every((d) => DATE_LIST_REGEX.test(d)),
    { message: "Dates must be YYYY-MM-DD, comma-separated" },
  ),
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

  const [slug, setSlug] = useState(billboardId ?? "");
  const [slugEdited, setSlugEdited] = useState(mode === "edit");

  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryProgress, setPrimaryProgress] = useState<number | null>(null);
  const [existingImage, setExistingImage] = useState(initialValues?.image ?? "");

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [existingGallery, setExistingGallery] = useState<string[]>(initialValues?.gallery ?? []);

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
      priceRange: initialValues?.priceRange ?? "",
      priceTier: initialValues?.priceTier ?? "",
      lighting: initialValues?.lighting ?? "",
      description: initialValues?.description ?? "",
      recommendedIndustries: toCommaString(initialValues?.recommendedIndustries ?? []),
      bestFor: toCommaString(initialValues?.bestFor ?? []),
      nearbyLandmarks: toCommaString(initialValues?.nearbyLandmarks ?? []),
      tags: toCommaString(initialValues?.tags ?? []),
      bookedDates: toCommaString(initialValues?.bookedDates ?? []),
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
        priceRange: values.priceRange,
        priceTier: values.priceTier,
        lighting: values.lighting,
        description: values.description,
        recommendedIndustries: parseList(values.recommendedIndustries),
        bestFor: parseList(values.bestFor),
        nearbyLandmarks: parseList(values.nearbyLandmarks),
        tags: parseList(values.tags),
        bookedDates: parseList(values.bookedDates),
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
      toast.error(err instanceof Error ? err.message : "Couldn't save this billboard. Please try again.");
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4 rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline"
      >
        {mode === "create" && (
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Billboard ID / Slug
            </label>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugEdited(true);
              }}
              placeholder="e.g. lagos-lekki-expressway"
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <p className="mt-1.5 text-[0.8rem] text-muted-foreground">Used in the URL — auto-suggested from city/area, editable.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="city" label="City" />
          <TextField control={form.control} name="area" label="Area" />
        </div>
        <TextField control={form.control} name="landmark" label="Landmark" />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="lat" label="Latitude" type="number" step="any" />
          <TextField control={form.control} name="lng" label="Longitude" type="number" step="any" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField control={form.control} name="billboardType" label="Billboard Type" options={BILLBOARD_TYPES.filter((t) => t !== "All")} />
          <SelectField control={form.control} name="availability" label="Availability" options={AVAILABILITIES.filter((a) => a !== "All")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="size" label="Size" />
          <TextField control={form.control} name="estimatedDailyImpressions" label="Estimated Daily Impressions" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="priceRange" label="Price Range" />
          <TextField control={form.control} name="priceTier" label="Price Tier" />
        </div>

        <TextField control={form.control} name="lighting" label="Lighting" />
        <TextAreaField control={form.control} name="description" label="Description" />
        <TextField control={form.control} name="recommendedIndustries" label="Recommended Industries (comma-separated)" />
        <TextField control={form.control} name="bestFor" label="Best For (comma-separated)" />
        <TextField control={form.control} name="nearbyLandmarks" label="Nearby Landmarks (comma-separated)" />
        <TextField control={form.control} name="tags" label="Tags (comma-separated)" />
        <TextField control={form.control} name="bookedDates" label="Booked Dates (YYYY-MM-DD, comma-separated)" />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Primary Image
          </label>
          {existingImage && !primaryFile && (
            <img src={existingImage} alt="Current billboard" className="mb-2 h-32 w-full rounded-lg object-cover" />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground hover:border-gold hover:text-gold">
            <Upload className="h-4 w-4" />
            {primaryFile ? primaryFile.name : existingImage ? "Replace image" : "Upload primary image"}
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
            {galleryFiles.length > 0 ? `${galleryFiles.length} new image(s) selected` : "Add gallery images"}
            <input type="file" accept="image/*" multiple onChange={onGalleryFilesChange} className="hidden" />
          </label>
          {galleryUploading && <p className="mt-2 text-xs text-muted-foreground">Uploading gallery images…</p>}
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
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  name: keyof BillboardFormValues;
  label: string;
  type?: string;
  step?: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</FormLabel>
          <FormControl>
            <input
              {...field}
              type={type}
              step={step}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </FormControl>
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
}: {
  control: ReturnType<typeof useForm<BillboardFormValues>>["control"];
  name: keyof BillboardFormValues;
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</FormLabel>
          <FormControl>
            <textarea
              {...field}
              rows={4}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </FormControl>
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
          <FormLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</FormLabel>
          <FormControl>
            <select
              {...field}
              className="w-full appearance-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
