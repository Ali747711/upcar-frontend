/**
 * Domain types shared across the parts table, preview, and the
 * generate-PDF request. These mirror the backend contract documented in
 * project-details.md — keep them in sync with `../backend`.
 */

export interface Part {
  id: string
  partCode: string // exactly 12 digits
  quantity: number
  price: number
  checked: boolean
  /** Object URL / base64 / remote URL used for the inline preview. */
  imageUrl?: string
  /** Cloudinary public_id — required to delete the image later. */
  imagePublicId?: string
  /** Original file name, kept for display only. */
  imageName?: string
}

export interface CarInfo {
  carName: string
  carNumber: string
}

/** Payload sent to `POST /generate-pdf`. */
export interface GeneratePdfPayload extends CarInfo {
  parts: Part[]
}
