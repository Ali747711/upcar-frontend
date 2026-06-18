import { API_BASE_URL, GENERATE_PDF_ENDPOINT } from "@/lib/constants"
import { getToken, notifyUnauthorized } from "@/lib/auth/token"
import type { GeneratePdfPayload } from "@/types/part"

function buildFileName(carName: string): string {
  const slug =
    carName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "parts-sheet"
  const date = new Date().toISOString().slice(0, 10)
  return `${slug}-${date}.pdf`
}

/** Extract a readable message from a failed (JSON) PDF response. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: string
      details?: { message: string }[]
    }
    const base = body.error ?? "PDF generation failed"
    return body.details?.length
      ? `${base}: ${body.details.map((d) => d.message).join(", ")}`
      : base
  } catch {
    return `PDF generation failed (${response.status})`
  }
}

/** Trigger a browser download for a PDF blob. */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Send the document to the backend, receive the rendered PDF, and start a
 * download. Errors are thrown with user-friendly messages for the caller
 * to surface (e.g. via toast).
 */
export async function generatePdf(payload: GeneratePdfPayload): Promise<void> {
  const token = getToken()

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${GENERATE_PDF_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error("Could not reach the server. Is the backend running?")
  }

  if (!response.ok) {
    // Token rejected: clear it and force a logout, mirroring apiRequest.
    if (response.status === 401 && token) {
      notifyUnauthorized()
    }
    // On failure the backend returns a JSON error envelope, not a PDF.
    throw new Error(await readErrorMessage(response))
  }

  const blob = await response.blob()
  downloadBlob(blob, buildFileName(payload.carName))
}
