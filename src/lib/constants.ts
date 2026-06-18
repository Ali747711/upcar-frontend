/**
 * App-wide configuration. The backend base URL must come from the
 * environment (see `.env`), never hardcoded — see project CLAUDE.md.
 */

const DEFAULT_API_BASE_URL = "http://localhost:4000"

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL

export const GENERATE_PDF_ENDPOINT = "/generate-pdf"

/** Matches the backend's MAX_PAGE_SIZE; used when listing documents. */
export const MAX_PAGE_SIZE = 100

/** Mirrors the backend's MAX_UPLOAD_BYTES (default 8 MB) for fast UI feedback. */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8 MB

/** Image upload endpoint (multipart/form-data, field "image"). */
export const UPLOAD_ENDPOINT = "/upload"

export const CURRENCY = "USD"
