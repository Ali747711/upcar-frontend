import type { CarInfo, Part } from "@/types/part"
export interface PartErrors {
  partCode?: string
  quantity?: string
  price?: string
}

/** Validate a single part. Empty object means the row is valid. */
export function validatePart(part: Part): PartErrors {
  const errors: PartErrors = {}

  if (!part.partCode.trim()) {
    errors.partCode = "Part code is required"
  }

  if (!Number.isFinite(part.quantity) || part.quantity <= 0) {
    errors.quantity = "Quantity must be greater than 0"
  }

  if (!Number.isFinite(part.price) || part.price < 0) {
    errors.price = "Price must be 0 or more"
  }

  return errors
}

export function isPartValid(part: Part): boolean {
  return Object.keys(validatePart(part)).length === 0
}

export interface FormValidation {
  valid: boolean
  /** Human-readable reason the form can't be submitted yet. */
  reason?: string
}

/**
 * Validate the whole document before sending it to the backend.
 * Returns the first blocking reason so the UI can surface it.
 */
export function validateDocument(
  carInfo: CarInfo,
  parts: Part[]
): FormValidation {
  if (!carInfo.carName.trim()) {
    return { valid: false, reason: "Enter a car name" }
  }

  if (!carInfo.carNumber.trim()) {
    return { valid: false, reason: "Enter a car number" }
  }

  if (parts.length === 0) {
    return { valid: false, reason: "Add at least one part" }
  }

  const invalidIndex = parts.findIndex((part) => !isPartValid(part))
  if (invalidIndex !== -1) {
    return {
      valid: false,
      reason: `Fix the highlighted fields in row ${invalidIndex + 1}`,
    }
  }

  return { valid: true }
}
