// Amount inputs accept comma-formatted numbers ("500,000") — strip everything
// but digits to get the real number back out.
export function parseAmount(input: string): number {
  return Number(input.replace(/[^0-9]/g, ""));
}

// Re-inserts thousands separators as the user types, so "500000" becomes
// "500,000" without them needing to type the commas themselves.
export function formatAmountInput(input: string): string {
  const digits = input.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}
