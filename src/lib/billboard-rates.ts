import { BILLBOARD_DURATIONS, type Billboard, type BillboardDuration } from "@/data/billboards";
import { formatNaira } from "@/lib/invoice";

// Short suffixes for the compact card display, e.g. "From ₦150,000/wk".
const DURATION_ABBREVIATIONS: Record<BillboardDuration, string> = {
  "1 Week": "wk",
  "2 Weeks": "2wks",
  "1 Month": "mo",
  "3 Months": "3mo",
  "1 Year": "yr",
};

type Rates = Billboard["rates"];

function filledEntries(rates: Rates): [BillboardDuration, number][] {
  return BILLBOARD_DURATIONS.filter((d) => rates[d] != null).map((d) => [d, rates[d]!]);
}

// The cheapest entry point across whichever durations are actually priced —
// used for the compact "From ₦X" card display.
export function getStartingRate(
  rates: Rates,
): { duration: BillboardDuration; amount: number } | null {
  const entries = filledEntries(rates);
  if (entries.length === 0) return null;
  return entries.reduce(
    (min, [duration, amount]) => (amount < min.amount ? { duration, amount } : min),
    {
      duration: entries[0][0],
      amount: entries[0][1],
    },
  );
}

export function getPriceTierLabel(rates: Rates): string {
  const starting = getStartingRate(rates);
  if (!starting) return "Contact for pricing";
  return `From ${formatNaira(starting.amount)}/${DURATION_ABBREVIATIONS[starting.duration]}`;
}

// Full rate table for the billboard's own detail page, e.g.
// "1 Week: ₦150,000 · 1 Month: ₦450,000 · 3 Months: ₦1,200,000".
export function getRatesSummary(rates: Rates): string {
  const entries = filledEntries(rates);
  if (entries.length === 0) return "Contact for pricing";
  return entries.map(([duration, amount]) => `${duration}: ${formatNaira(amount)}`).join(" · ");
}
