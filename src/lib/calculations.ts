import type { Part } from "@/types/part"

/** Row total = quantity × price. Returns 0 for invalid numbers. */
export function rowTotal(part: Pick<Part, "quantity" | "price">): number {
  const quantity = Number.isFinite(part.quantity) ? part.quantity : 0
  const price = Number.isFinite(part.price) ? part.price : 0
  return quantity * price
}

/** Grand total across every row (regardless of checked status). */
export function grandTotal(parts: Part[]): number {
  return parts.reduce((sum, part) => sum + rowTotal(part), 0)
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
