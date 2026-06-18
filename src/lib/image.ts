import { MAX_IMAGE_BYTES } from "@/lib/constants"

/**
 * Client-side pre-check before uploading an image. Returns an error message,
 * or null when the file is acceptable. The backend enforces the same rules,
 * but this gives the user instant feedback.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file"
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const limitMb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024))
    return `Image is too large (max ${limitMb} MB)`
  }
  return null
}
