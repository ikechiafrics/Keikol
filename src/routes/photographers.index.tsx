import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Camera, Filter, MapPin, Search, Video } from "lucide-react";

import { PageHero, Section, SectionHeader } from "@/components";
import { Skeleton } from "@/components/ui/skeleton";
import { usePhotographers } from "@/lib/photographers-data";
import { SPECIALTIES, type PhotographerSpecialty } from "@/lib/photographer-types";
import { useImageLoaded } from "@/lib/use-image-loaded";
import type { Photographer } from "@/lib/photographer-types";

export const Route = createFileRoute("/photographers/")({
  head: () => ({
    meta: [
      { title: "Photographers & Videographers — Keikol" },
      {
        name: "description",
        content:
          "Browse Keikol's partnered photographers and videographers, view their portfolios, and request a quote.",
      },
    ],
  }),
  component: PhotographersPage,
});

function PhotographersPage() {
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState<"All" | PhotographerSpecialty>("All");
  const [country, setCountry] = useState("All");

  const { data: photographers, isLoading } = usePhotographers();
  const active = useMemo(() => (photographers ?? []).filter((p) => p.active), [photographers]);

  const countryOptions = useMemo(
    () => ["All", ...Array.from(new Set(active.map((p) => p.country))).sort()],
    [active],
  );

  const filtered = useMemo(() => {
    return active.filter((p) => {
      if (specialty !== "All" && !p.specialties.includes(specialty)) return false;
      if (country !== "All" && p.country !== country) return false;
      if (q) {
        const t = q.toLowerCase();
        if (
          !p.name.toLowerCase().includes(t) &&
          !p.city.toLowerCase().includes(t) &&
          !p.country.toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    });
  }, [active, specialty, country, q]);

  const hasFilters = q || specialty !== "All" || country !== "All";
  function clearFilters() {
    setQ("");
    setSpecialty("All");
    setCountry("All");
  }

  return (
    <>
      <PageHero
        eyebrow="Photography & Videography"
        title={
          <>
            Meet Keikol's <span className="text-gradient-gold">creative partners.</span>
          </>
        }
        subtitle="Browse partnered photographers and videographers, view their portfolios, and request a quote directly."
      />

      <Section>
        <div className="rounded-3xl bg-card-premium p-5 shadow-elegant ring-hairline sm:p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Filter className="h-4 w-4 text-gold" /> Filter
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, city, or country"
                className="w-full rounded-xl border border-border bg-background/60 py-3 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value as typeof specialty)}
              className="w-full appearance-none rounded-xl border border-border bg-background/60 px-3 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              <option value="All">Specialty: All</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  Specialty: {s}
                </option>
              ))}
            </select>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background/60 px-3 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  Country: {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{filtered.length}</span> photographer
              {filtered.length === 1 ? "" : "s"}/videographer{filtered.length === 1 ? "" : "s"} found
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="font-semibold text-gold hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <PhotographerCardSkeleton key={i} />)}
          {!isLoading && filtered.map((p) => <PhotographerCard key={p.id} p={p} />)}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-8 text-center">
            <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-display font-bold">No photographers match your filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try clearing the filters, or contact us for a recommendation.
            </p>
          </div>
        )}
      </Section>

      <Section tone="surface">
        <SectionHeader
          eyebrow="Growing Network"
          title={
            <>
              Partnered creatives, <span className="text-gradient-gold">added over time.</span>
            </>
          }
          subtitle="Keikol partners with independent photographers and videographers around the world — this list grows as new creatives join."
        />
      </Section>
    </>
  );
}

function PhotographerCard({ p }: { p: Photographer }) {
  const { loaded, onLoad, imgRef } = useImageLoaded();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
        {p.profileImage && (
          <img
            ref={imgRef}
            src={p.profileImage}
            alt={p.name}
            loading="lazy"
            onLoad={onLoad}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold">{p.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {p.city}, {p.country}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.specialties.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {s === "Photography" ? <Camera className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              {s}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-gold">{p.rateNote}</p>
        <div className="mt-5">
          <Link
            to="/photographers/$id"
            params={{ id: p.id }}
            className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-gold px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            View Profile <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PhotographerCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
