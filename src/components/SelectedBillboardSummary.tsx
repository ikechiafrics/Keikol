import { Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import type { Billboard } from "@/data/billboards";

export function SelectedBillboardSummary({
  billboard,
  className = "",
}: {
  billboard: Billboard;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-5 shadow-elegant ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold text-primary-foreground">
          <Tag className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold">Selected Billboard</p>
          <p className="mt-1 font-display text-base font-bold">{billboard.city} — {billboard.area}</p>
          <p className="text-xs text-muted-foreground">{billboard.billboardType} · {billboard.estimatedDailyImpressions} daily impressions</p>
        </div>
      </div>
      <Link
        to="/locations/$id"
        params={{ id: billboard.id }}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-4 py-2 text-xs font-semibold hover:border-gold hover:text-gold"
      >
        View billboard details
      </Link>
    </div>
  );
}
