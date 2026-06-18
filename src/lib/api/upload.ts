import { API_BASE_URL, UPLOAD_ENDPOINT } from "@/lib/constants"
import { getToken, notifyUnauthorized } from "@/lib/auth/token"
import { validateImageFile } from "@/lib/image"

interface UploadResponse {
  success: boolean
  data?: { url: string; publicId: string; width: number; height: number }
  error?: string
  details?: { message: string }[]
}

export interface UploadResult {
  url: string
  publicId: string
}

/**
 * Upload an image to the backend, which stores it on Cloudinary and returns a
 * hosted, optimized URL + publicId. Both are persisted on the part so the image
 * can be deleted later when the row is removed.
 *
 * @throws Error with a user-friendly message on validation/transport failure
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const validationError = validateImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const formData = new FormData()
  formData.append("image", file)

  const token = getToken()

  let response: Response
  try {
    // Note: no Content-Type header — the browser sets the multipart boundary.
    response = await fetch(`${API_BASE_URL}${UPLOAD_ENDPOINT}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    })
  } catch {
    throw new Error("Could not reach the server. Is the backend running?")
  }

  let body: UploadResponse
  try {
    body = (await response.json()) as UploadResponse
  } catch {
    throw new Error(`Image upload failed (${response.status})`)
  }

  if (!response.ok || !body.success || !body.data) {
    if (response.status === 401 && token) {
      notifyUnauthorized()
    }
    const base = body.error ?? "Image upload failed"
    throw new Error(
      body.details?.length
        ? `${base}: ${body.details.map((d) => d.message).join(", ")}`
        : base
    )
  }

  return { url: body.data.url, publicId: body.data.publicId }
}

/**
 * Delete a previously uploaded image from Cloudinary by its public id.
 * Best-effort — callers should fire-and-forget and not surface errors to users.
 */
export async function deleteUploadedImage(publicId: string): Promise<void> {
  const token = getToken()
  const response = await fetch(
    `${API_BASE_URL}/upload?publicId=${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  )
  if (response.status === 401 && token) {
    notifyUnauthorized()
  }
}
