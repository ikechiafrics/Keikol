import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { db, storage, photographerStoragePath } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { logAudit } from "@/lib/audit-log";
import {
  SPECIALTIES,
  CURRENCY_OPTIONS,
  type Photographer,
  type PhotographerSpecialty,
  type Currency,
} from "@/lib/photographer-types";

const photographerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.enum([...CURRENCY_OPTIONS] as [Currency, ...Currency[]]),
  rateNote: z.string().min(1, "Rate note is required"),
});
type PhotographerFormValues = z.infer<typeof photographerFormSchema>;

export function PhotographerForm({
  mode,
  initialValues,
  photographerId,
}: {
  mode: "create" | "edit";
  initialValues?: Photographer;
  photographerId?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [specialties, setSpecialties] = useState<PhotographerSpecialty[]>(
    initialValues?.specialties ?? [],
  );
  const [active, setActive] = useState(initialValues?.active ?? true);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileProgress, setProfileProgress] = useState<number | null>(null);
  const [existingProfileImage, setExistingProfileImage] = useState(
    initialValues?.profileImage ?? "",
  );

  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [existingPortfolio, setExistingPortfolio] = useState<string[]>(
    initialValues?.portfolioImages ?? [],
  );

  const [videoLinks, setVideoLinks] = useState<string[]>(initialValues?.videoLinks ?? []);
  const [videoLinkInput, setVideoLinkInput] = useState("");

  const form = useForm<PhotographerFormValues>({
    resolver: zodResolver(photographerFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      bio: initialValues?.bio ?? "",
      city: initialValues?.city ?? "",
      country: initialValues?.country ?? "",
      currency: initialValues?.currency ?? "NGN",
      rateNote: initialValues?.rateNote ?? "",
    },
  });

  function toggleSpecialty(s: PhotographerSpecialty) {
    setSpecialties((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function onProfileFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.type.startsWith("image/")) {
      toast.error("Profile image must be an image file.");
      return;
    }
    setProfileFile(f);
  }

  function onPortfolioFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.some((f) => !f.type.startsWith("image/"))) {
      toast.error("Portfolio uploads must be image files.");
      return;
    }
    setPortfolioFiles((prev) => [...prev, ...files]);
  }

  function addVideoLink() {
    const url = videoLinkInput.trim();
    if (!url) return;
    setVideoLinks((prev) => [...prev, url]);
    setVideoLinkInput("");
  }

  const mutation = useMutation({
    mutationFn: async (values: PhotographerFormValues) => {
      if (specialties.length === 0) throw new Error("Select at least one specialty.");

      const id = mode === "create" ? doc(collection(db, "photographers")).id : photographerId!;

      let profileImage = existingProfileImage;
      if (profileFile) {
        const path = photographerStoragePath(id, `${Date.now()}-${profileFile.name}`);
        const storageRef = ref(storage, path);
        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, profileFile);
          task.on(
            "state_changed",
            (snap) =>
              setProfileProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            () => resolve(),
          );
        });
        profileImage = await getDownloadURL(storageRef);
        setProfileProgress(null);
      }

      let portfolioImages = existingPortfolio;
      if (portfolioFiles.length > 0) {
        setPortfolioUploading(true);
        try {
          const uploaded = await Promise.all(
            portfolioFiles.map(async (f): Promise<string> => {
              const path = photographerStoragePath(id, `${Date.now()}-${f.name}`);
              const storageRef = ref(storage, path);
              await uploadBytesResumable(storageRef, f);
              return getDownloadURL(storageRef);
            }),
          );
          portfolioImages = [...existingPortfolio, ...uploaded];
        } finally {
          setPortfolioUploading(false);
        }
      }

      const data = {
        name: values.name,
        bio: values.bio,
        city: values.city,
        country: values.country,
        currency: values.currency,
        rateNote: values.rateNote,
        specialties,
        active,
        profileImage,
        portfolioImages,
        videoLinks,
        updatedAt: serverTimestamp(),
      };

      const batch = writeBatch(db);
      if (mode === "create") {
        batch.set(doc(db, "photographers", id), { ...data, createdAt: serverTimestamp() });
      } else {
        batch.update(doc(db, "photographers", id), data);
      }
      logAudit(
        batch,
        { uid: user!.uid, email: user!.email },
        {
          action: mode === "create" ? "photographer.created" : "photographer.updated",
          targetType: "photographer",
          targetId: id,
          summary: `${mode === "create" ? "Created" : "Updated"} photographer profile "${values.name}"`,
        },
      );
      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-photographers"] });
      queryClient.invalidateQueries({ queryKey: ["photographers"] });
      if (photographerId)
        queryClient.invalidateQueries({ queryKey: ["photographer", photographerId] });
      toast.success(mode === "create" ? "Photographer profile created." : "Profile updated.");
      navigate({ to: "/admin/photographers" });
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Couldn't save this profile. Please try again.",
      );
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4 rounded-3xl bg-card-premium p-7 shadow-elegant ring-hairline"
      >
        <TextField control={form.control} name="name" label="Name" placeholder="Full name" />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Specialties
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  specialties.includes(s)
                    ? "border-gold bg-gold text-primary-foreground"
                    : "border-border bg-background/60 text-muted-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField control={form.control} name="city" label="City" placeholder="e.g. Toronto" />
          <TextField
            control={form.control}
            name="country"
            label="Country"
            placeholder="e.g. Canada"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="currency"
            label="Payout Currency"
            options={CURRENCY_OPTIONS}
          />
          <TextField
            control={form.control}
            name="rateNote"
            label="Rate Note"
            placeholder='e.g. "From $150/hr" or "Contact for rate"'
          />
        </div>

        <TextAreaField control={form.control} name="bio" label="Bio" />

        <div className="flex items-center gap-3">
          <Switch id="active" checked={active} onCheckedChange={(v) => setActive(v === true)} />
          <label
            htmlFor="active"
            className="cursor-pointer text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Active (visible in the public directory)
          </label>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Profile Image
          </label>
          {existingProfileImage && !profileFile && (
            <img
              src={existingProfileImage}
              alt="Current profile"
              className="mb-2 h-32 w-32 rounded-lg object-cover"
            />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground hover:border-gold hover:text-gold">
            <Upload className="h-4 w-4" />
            {profileFile
              ? profileFile.name
              : existingProfileImage
                ? "Replace image"
                : "Upload profile image"}
            <input type="file" accept="image/*" onChange={onProfileFileChange} className="hidden" />
          </label>
          {profileProgress !== null && (
            <div className="mt-3">
              <Progress value={profileProgress} />
              <p className="mt-1 text-xs text-muted-foreground">Uploading… {profileProgress}%</p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Portfolio
          </label>
          {existingPortfolio.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {existingPortfolio.map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img src={url} alt="Portfolio" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setExistingPortfolio((prev) => prev.filter((u) => u !== url))
                    }
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
            {portfolioFiles.length > 0
              ? `${portfolioFiles.length} new image(s) selected`
              : "Add portfolio images"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onPortfolioFilesChange}
              className="hidden"
            />
          </label>
          {portfolioUploading && (
            <p className="mt-2 text-xs text-muted-foreground">Uploading portfolio images…</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Video Links (YouTube/Vimeo)
          </label>
          {videoLinks.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {videoLinks.map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  <span className="truncate">{url}</span>
                  <button
                    type="button"
                    onClick={() => setVideoLinks((prev) => prev.filter((u) => u !== url))}
                    className="ml-2 shrink-0 hover:text-destructive"
                    aria-label="Remove video link"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={videoLinkInput}
              onChange={(e) => setVideoLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVideoLink();
                }
              }}
              placeholder="https://youtube.com/..."
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <button
              type="button"
              onClick={addVideoLink}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:border-gold hover:text-gold"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {mutation.isPending
            ? "Saving…"
            : mode === "create"
              ? "Create Profile"
              : "Save Changes"}
        </button>
      </form>
    </Form>
  );
}

function TextField({
  control,
  name,
  label,
  placeholder,
}: {
  control: ReturnType<typeof useForm<PhotographerFormValues>>["control"];
  name: keyof PhotographerFormValues;
  label: string;
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
              placeholder={placeholder}
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
  control: ReturnType<typeof useForm<PhotographerFormValues>>["control"];
  name: keyof PhotographerFormValues;
  label: string;
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
  control: ReturnType<typeof useForm<PhotographerFormValues>>["control"];
  name: keyof PhotographerFormValues;
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
