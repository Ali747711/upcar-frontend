import type { Part } from "@/types/part"

/**
 * Client-facing unit price after markup, rounded to a whole number.
 * 0% returns the base price unchanged (no rounding).
 * MUST stay in sync with backend `src/utils/money.js` — the backend applies
 * this exact formula when rendering the PDF.
 */
export function applyMarkup(price: number, markupPercent = 0): number {
  const base = Number.isFinite(price) ? price : 0
  const pct = Number.isFinite(markupPercent) ? markupPercent : 0
  if (pct === 0) return base
  return Math.round(base * (1 + pct / 100))
}

/** Row total = quantity × marked-up unit price. Returns 0 for invalid numbers. */
export function rowTotal(
  part: Pick<Part, "quantity" | "price">,
  markupPercent = 0
): number {
  const quantity = Number.isFinite(part.quantity) ? part.quantity : 0
  return quantity * applyMarkup(part.price, markupPercent)
}

/** Grand total across every row (regardless of checked status). */
export function grandTotal(parts: Part[], markupPercent = 0): number {
  return parts.reduce((sum, part) => sum + rowTotal(part, markupPercent), 0)
}

// Dot as thousands separator, no currency symbol, no trailing decimal zeros.
// e.g. 10000 → "10.000", 1500.5 → "1.500,5", 150 → "150"
const numberFormatter = new Intl.NumberFormat("de-DE", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number): string {
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}
