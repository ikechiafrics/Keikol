import { Link } from "@tanstack/react-router";
import { ChevronRight, Eye, MapPin, Ruler } from "lucide-react";
import type { Billboard } from "@/data/billboards";
import type { StatusBadgeClasses } from "@/lib/status-badge";

const AVAILABILITY_CLASSES: Record<Billboard["availability"], StatusBadgeClasses> = {
  Available: { dot: "bg-accent", text: "text-accent", bg: "bg-accent/20" },
  "Available Soon": { dot: "bg-electric-soft", text: "text-electric-soft", bg: "bg-electric/15" },
  "Coming Soon": { dot: "bg-gold", text: "text-gold", bg: "bg-gold/20" },
};

export function BillboardCard({
  b,
  compact = false,
  selected = false,
  onSelect,
}: {
  b: Billboard;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const s = AVAILABILITY_CLASSES[b.availability];
  return (
    <article
      onClick={onSelect}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-card-premium shadow-elegant ring-hairline transition-all hover:-translate-y-1 hover:shadow-glow ${
        selected ? "outline outline-2 outline-offset-2 outline-gold" : ""
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={b.image}
          alt={`${b.billboardType} in ${b.area}, ${b.city}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${s.bg} ${s.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {b.availability}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">{b.city}</p>
        <h3 className="mt-1 font-display text-lg font-bold">{b.area}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {b.landmark}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{b.billboardType}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-accent" />
            <span className="font-semibold">{b.estimatedDailyImpressions}</span>
            <span className="text-muted-foreground">/ day</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Ruler className="h-4 w-4" /> {b.size}
          </span>
        </div>
        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {b.recommendedIndustries.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link
            to="/locations/$id"
            params={{ id: b.id }}
            className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
          >
            View Details
          </Link>
          <Link
            to="/book/$id"
            params={{ id: b.id }}
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-gold px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
          >
            Book Now <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
