// Generic multi-currency formatter for photographer/videographer rates —
// distinct from src/lib/invoice.ts's formatNaira, which stays Naira-only
// since the billboard business is Nigeria-only.
export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}
