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

// Exact pricing — for internal/admin use only (inventory management, contract
// snapshots). Public-facing pages use the relative tier below instead, so
// exact rates aren't published to anonymous visitors or competitors.
export function getPriceTierLabel(rates: Rates): string {
  const starting = getStartingRate(rates);
  if (!starting) return "Contact for pricing";
  return `From ${formatNaira(starting.amount)}/${DURATION_ABBREVIATIONS[starting.duration]}`;
}

// Full rate table — also internal/admin/snapshot use only, same reasoning
// as getPriceTierLabel above.
export function getRatesSummary(rates: Rates): string {
  const entries = filledEntries(rates);
  if (entries.length === 0) return "Contact for pricing";
  return entries.map(([duration, amount]) => `${duration}: ${formatNaira(amount)}`).join(" · ");
}

// Rough weeks-per-duration, used only to put different durations' starting
// rates on a comparable per-week basis before ranking — not shown to users.
const WEEKS_PER_DURATION: Record<BillboardDuration, number> = {
  "1 Week": 1,
  "2 Weeks": 2,
  "1 Month": 4,
  "3 Months": 13,
  "1 Year": 52,
};

function normalizedWeeklyRate(rates: Rates): number | null {
  const starting = getStartingRate(rates);
  if (!starting) return null;
  return starting.amount / WEEKS_PER_DURATION[starting.duration];
}

export type PriceTierLevel = "Standard" | "Premium" | "Elite";

export const PRICE_TIER_LABELS: Record<PriceTierLevel, string> = {
  Standard: "Standard",
  Premium: "Premium",
  Elite: "Elite",
};

// Public-facing price indicator: a relative tier (bottom/middle/top third of
// current inventory by normalized rate) instead of an exact figure. Computed
// from the live billboard list rather than fixed price thresholds, so it
// stays meaningful as inventory/rates change without publishing real numbers.
export function computePriceTiers(billboards: Billboard[]): Record<string, PriceTierLevel | null> {
  const ranked = billboards
    .map((b) => ({ id: b.id, rate: normalizedWeeklyRate(b.rates) }))
    .filter((x): x is { id: string; rate: number } => x.rate !== null)
    .sort((a, b) => a.rate - b.rate);

  const result: Record<string, PriceTierLevel | null> = {};
  billboards.forEach((b) => {
    result[b.id] = null;
  });

  const n = ranked.length;
  ranked.forEach((entry, i) => {
    const percentile = n <= 1 ? 0 : i / (n - 1);
    result[entry.id] = percentile < 1 / 3 ? "Standard" : percentile < 2 / 3 ? "Premium" : "Elite";
  });

  return result;
}
