import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  ArrowRight, Filter, MapPin, Search, Target, Clock, Users, Compass,
  Map as MapIcon, LayoutGrid, X, ChevronLeft, ChevronRight, Eye, Ruler,
  Calendar as CalIcon, Landmark,
} from "lucide-react";

import { PageHero, Section, SectionHeader, CTASection } from "@/components";
import { BillboardCard } from "@/components/BillboardCard";
import {
  BILLBOARDS,
  CITIES,
  BILLBOARD_TYPES,
  AVAILABILITIES,
  INDUSTRY_FILTERS,
  heroImg,
  type Billboard,
} from "@/data/billboards";

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "Billboard Locations — Interactive Map | Keikol" },
      {
        name: "description",
        content:
          "Explore Keikol's billboard inventory on an interactive map of Nigeria. Filter by city, type, industry, and availability across Lagos, Abuja, Port Harcourt, and Kano.",
      },
      { property: "og:title", content: "Billboard Locations — Interactive Map | Keikol" },
      {
        property: "og:description",
        content: "Interactive map, filters, traffic estimates, photos, and availability for Keikol billboards.",
      },
      { property: "og:url", content: "/locations" },
      { property: "og:image", content: heroImg },
    ],
    links: [{ rel: "canonical", href: "/locations" }],
  }),
  component: LocationsPage,
});

// Client-only map component (Leaflet touches window on mount).
const BillboardMap = lazy(() => import("@/components/BillboardMap"));

type View = "map" | "grid";

function LocationsPage() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<(typeof CITIES)[number]>("All");
  const [type, setType] = useState<(typeof BILLBOARD_TYPES)[number]>("All");
  const [avail, setAvail] = useState<(typeof AVAILABILITIES)[number]>("All");
  const [industry, setIndustry] = useState<(typeof INDUSTRY_FILTERS)[number]>("All");

  const [view, setView] = useState<View>("map");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    return BILLBOARDS.filter((b) => {
      if (city !== "All" && b.city !== city) return false;
      if (type !== "All" && b.billboardType !== type) return false;
      if (avail !== "All" && b.availability !== avail) return false;
      if (
        industry !== "All" &&
        !b.recommendedIndustries.some((i) => i.toLowerCase().includes(industry.toLowerCase()))
      )
        return false;
      if (q) {
        const t = q.toLowerCase();
        if (
          !b.city.toLowerCase().includes(t) &&
          !b.area.toLowerCase().includes(t) &&
          !b.landmark.toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    });
  }, [q, city, type, avail, industry]);

  const selected = selectedId ? BILLBOARDS.find((b) => b.id === selectedId) ?? null : null;
  const hasFilters = q || city !== "All" || type !== "All" || avail !== "All" || industry !== "All";

  function clearFilters() {
    setQ(""); setCity("All"); setType("All"); setAvail("All"); setIndustry("All");
  }

  return (
    <>
      <PageHero
        eyebrow="Billboard Locations"
        title={<>Explore Premium <span className="text-gradient-gold">Billboard Locations</span></>}
        subtitle="Browse Keikol's inventory on an interactive map, filter by city or industry, and tap any pin to see photos, traffic, and availability."
        image={heroImg}
      />

      <Section>
        {/* Filters */}
        <div className="rounded-3xl bg-card-premium p-5 shadow-elegant ring-hairline sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Filter className="h-4 w-4 text-gold" /> Filter locations
            </div>
            <ViewToggle view={view} setView={setView} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_repeat(4,_1fr)]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search city, area, or landmark"
                className="w-full rounded-xl border border-border bg-background/60 py-3 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </label>
            <Select value={city} onChange={(v) => setCity(v as typeof city)} options={CITIES} label="City" />
            <Select value={type} onChange={(v) => setType(v as typeof type)} options={BILLBOARD_TYPES} label="Type" />
            <Select value={avail} onChange={(v) => setAvail(v as typeof avail)} options={AVAILABILITIES} label="Availability" />
            <Select value={industry} onChange={(v) => setIndustry(v as typeof industry)} options={INDUSTRY_FILTERS} label="Industry" />
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="font-bold text-foreground">{filtered.length}</span> location
              {filtered.length === 1 ? "" : "s"} found
            </span>
            {hasFilters && (
              <button onClick={clearFilters} className="font-semibold text-gold hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Map view */}
        {view === "map" && (
          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="relative isolate h-[560px] overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline">
              {mounted ? (
                <Suspense fallback={<MapPlaceholder />}>
                  <BillboardMap billboards={filtered} selectedId={selectedId} onSelect={setSelectedId} />
                </Suspense>
              ) : (
                <MapPlaceholder />
              )}
              <div className="pointer-events-none absolute right-3 top-3 z-[500] flex flex-wrap justify-end gap-1.5">
                <Legend color="#F4C430" label="Available" />
                <Legend color="#60A5FA" label="Available Soon" />
                <Legend color="#9CA3AF" label="Coming Soon" />
              </div>
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] -translate-x-1/2 rounded-full bg-background/85 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-elegant backdrop-blur">
                Tap a pin to see details
              </div>
            </div>

            {/* Compact side list */}
            <aside className="max-h-[560px] overflow-y-auto rounded-2xl bg-card-premium p-3 shadow-elegant ring-hairline">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {filtered.length} matching billboards
              </p>
              <div className="grid gap-2">
                {filtered.map((b) => (
                  <ResultCard
                    key={b.id}
                    b={b}
                    active={selectedId === b.id}
                    onClick={() => setSelectedId(b.id)}
                  />
                ))}
                {filtered.length === 0 && (
                  <EmptyState onClear={clearFilters} />
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Grid view */}
        {view === "grid" && (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b) => <BillboardCard key={b.id} b={b} />)}
            </div>
            {filtered.length === 0 && (
              <div className="mt-10">
                <EmptyState onClear={clearFilters} />
              </div>
            )}
          </>
        )}
      </Section>

      {/* How to choose */}
      <Section tone="surface">
        <SectionHeader
          eyebrow="Guidance"
          title={<>How to choose the <span className="text-gradient-gold">right billboard.</span></>}
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Users, title: "Audience Fit", body: "Choose locations where your target customers live, work, or commute." },
            { icon: Target, title: "Traffic Volume", body: "High-traffic roads can improve daily visibility and campaign reach." },
            { icon: Compass, title: "Campaign Objective", body: "Brand awareness, product launches, and retail campaigns each need a different placement." },
            { icon: Clock, title: "Duration & Timing", body: "Longer campaigns can improve brand recall and customer familiarity." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-card-premium p-6 shadow-elegant ring-hairline">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-electric text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CTASection
        headline={<>Need help choosing the <span className="text-gradient-gold">right location?</span></>}
        subheadline="Tell us about your campaign goals and the Keikol team will recommend the best billboard placements for your brand."
      />

      {/* Slide-in details sidebar */}
      <DetailsSidebar billboard={selected} onClose={() => setSelectedId(null)} />
    </>
  );
}

/* ---------- Sub-components ---------- */

function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  const base = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors";
  return (
    <div className="inline-flex rounded-xl border border-border bg-background/60 p-1">
      <button
        onClick={() => setView("map")}
        className={`${base} ${view === "map" ? "bg-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={view === "map"}
      >
        <MapIcon className="h-3.5 w-3.5" /> Map
      </button>
      <button
        onClick={() => setView("grid")}
        className={`${base} ${view === "grid" ? "bg-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"}`}
        aria-pressed={view === "grid"}
      >
        <LayoutGrid className="h-3.5 w-3.5" /> Grid
      </button>
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-background/80">
      <div className="text-center text-muted-foreground">
        <MapPin className="mx-auto h-8 w-8 animate-pulse text-gold" />
        <p className="mt-2 text-sm">Loading interactive map…</p>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background/85 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 p-8 text-center">
      <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-display font-bold">No billboards match your filters</p>
      <p className="mt-1 text-xs text-muted-foreground">Try clearing the filters or contact us for a tailored recommendation.</p>
      <button
        onClick={onClear}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold"
      >
        Clear filters <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ResultCard({ b, active, onClick }: { b: Billboard; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-stretch gap-3 overflow-hidden rounded-xl bg-background/60 p-2 text-left ring-hairline transition-all hover:-translate-y-0.5 hover:shadow-glow ${
        active ? "outline outline-2 outline-gold" : ""
      }`}
    >
      <img src={b.image} alt={b.area} className="h-20 w-24 flex-none rounded-lg object-cover" />
      <div className="flex flex-1 flex-col justify-between py-0.5 pr-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold">{b.city}</p>
          <p className="font-display text-sm font-bold leading-tight">{b.area}</p>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{b.billboardType}</p>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3 text-accent" />{b.estimatedDailyImpressions}</span>
          <span className="font-bold text-gold">{b.priceTier}</span>
        </div>
      </div>
    </button>
  );
}

function Select({
  value, onChange, options, label,
}: {
  value: string; onChange: (v: string) => void; options: readonly string[]; label: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-border bg-background/60 px-3 py-3 text-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>{label}: {o}</option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Slide-in Details Sidebar ---------- */

function DetailsSidebar({
  billboard, onClose,
}: {
  billboard: Billboard | null; onClose: () => void;
}) {
  // Keep the last-shown billboard rendered during the close animation so
  // content doesn't disappear before the sidebar has finished sliding out.
  const [displayed, setDisplayed] = useState<Billboard | null>(billboard);
  const [imgIdx, setImgIdx] = useState(0);
  const open = billboard !== null;

  useEffect(() => {
    if (billboard) {
      setDisplayed(billboard);
      setImgIdx(0);
    } else {
      const t = setTimeout(() => setDisplayed(null), 350);
      return () => clearTimeout(t);
    }
  }, [billboard]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const b = displayed;

  return (
    <>
      {/* Subtle non-blocking scrim; click to dismiss */}
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className={`fixed inset-0 z-[900] bg-background/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="false"
        aria-label={b ? `${b.area} details` : "Billboard details"}
        className={`fixed right-0 top-0 z-[1000] flex h-full w-full max-w-md flex-col bg-background shadow-2xl ring-1 ring-border transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {b && (
          <>
            {/* Sticky header with close button */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold">{b.city}</p>
                <p className="truncate font-display text-sm font-bold">{b.area}</p>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 flex-none place-items-center rounded-full border border-border text-muted-foreground hover:border-gold hover:text-gold"
                aria-label="Close details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Gallery */}
              <div className="relative aspect-[16/10] w-full flex-none bg-surface">
                <img
                  src={b.gallery[imgIdx]}
                  alt={`${b.area} — photo ${imgIdx + 1}`}
                  className="h-full w-full object-cover"
                />
                {b.gallery.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + b.gallery.length) % b.gallery.length)}
                      className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % b.gallery.length)}
                      className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 backdrop-blur hover:bg-background"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {b.gallery.map((_, i) => (
                        <span key={i} className={`h-1.5 w-6 rounded-full ${i === imgIdx ? "bg-gold" : "bg-white/40"}`} />
                      ))}
                    </div>
                  </>
                )}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold backdrop-blur">
                  {b.availability}
                </span>
              </div>

              <div className="space-y-6 p-5">
                <header>
                  <h2 className="font-display text-2xl font-extrabold">{b.area}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {b.landmark}
                  </p>
                </header>

                <div className="grid grid-cols-3 gap-2 rounded-xl bg-card-premium p-3 ring-hairline">
                  <Stat icon={Eye} label="Daily traffic" value={b.estimatedDailyImpressions} />
                  <Stat icon={Ruler} label="Size" value={b.size} />
                  <Stat label="Price tier" value={b.priceTier} valueClass="text-gold" />
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>

                <div>
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                    <CalIcon className="h-4 w-4 text-gold" /> Availability calendar
                  </h3>
                  <AvailabilityCalendar bookedDates={b.bookedDates} />
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" /> Open</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-muted" /> Booked</span>
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold">
                    <Landmark className="h-4 w-4 text-gold" /> Nearby landmarks
                  </h3>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {b.nearbyLandmarks.map((l) => (
                      <li key={l} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {l}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display text-sm font-bold">Recommended for</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {b.recommendedIndustries.map((i) => (
                      <span key={i} className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted-foreground">
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky CTAs */}
            <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-border bg-background/95 p-4 backdrop-blur">
              <Link
                to="/locations/$id"
                params={{ id: b.id }}
                className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-3 text-sm font-semibold hover:border-gold hover:text-gold"
              >
                View full details
              </Link>
              <Link
                to="/book/$id"
                params={{ id: b.id }}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-gold px-3 py-3 text-sm font-semibold text-primary-foreground shadow-gold"
              >
                Book Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function Stat({ icon: Icon, label, value, valueClass = "" }: {
  icon?: typeof Eye; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="text-center">
      <p className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </p>
      <p className={`mt-1 font-display text-sm font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

/* ---------- Availability calendar ---------- */

function AvailabilityCalendar({ bookedDates }: { bookedDates: string[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const now = new Date();
  const base = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const view = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + monthOffset, 1));
  const year = view.getUTCFullYear();
  const month = view.getUTCMonth();
  const monthName = view.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const bookedSet = new Set(bookedDates);

  const cells: Array<{ date?: number; iso?: string; booked?: boolean }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({});
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date: d, iso, booked: bookedSet.has(iso) });
  }

  return (
    <div className="mt-2 rounded-xl border border-border bg-surface/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          disabled={monthOffset === 0}
          className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="font-display text-sm font-bold">{monthName}</span>
        <button
          onClick={() => setMonthOffset((m) => Math.min(3, m + 1))}
          disabled={monthOffset === 3}
          className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`grid aspect-square place-items-center rounded-md text-[11px] font-semibold ${
              !c.date
                ? ""
                : c.booked
                  ? "bg-muted/40 text-muted-foreground line-through"
                  : "bg-accent/15 text-accent"
            }`}
          >
            {c.date ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
