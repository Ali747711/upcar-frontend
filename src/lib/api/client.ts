import { API_BASE_URL } from "@/lib/constants"
import { getToken, notifyUnauthorized } from "@/lib/auth/token"

/** Field-level validation detail returned by the backend. */
interface ApiErrorDetail {
  path: string
  message: string
}

/** Standard response envelope used by every JSON endpoint. */
interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
  details?: ApiErrorDetail[]
  meta?: { total: number; page: number; limit: number }
}

export interface ApiResult<T> {
  data: T
  meta?: { total: number; page: number; limit: number }
}

/** Error thrown for any non-successful API response, with a readable message. */
export class ApiError extends Error {
  readonly status: number
  readonly details?: ApiErrorDetail[]

  constructor(message: string, status: number, details?: ApiErrorDetail[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

function buildMessage(envelope: ApiEnvelope<unknown>): string {
  const base = envelope.error ?? "Request failed"
  if (envelope.details?.length) {
    return `${base}: ${envelope.details.map((d) => d.message).join(", ")}`
  }
  return base
}

/**
 * Perform a JSON API request against the backend, unwrapping the response
 * envelope. Throws {@link ApiError} on transport failures or `success: false`.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getToken()

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError("Could not reach the server. Is the backend running?", 0)
  }

  let envelope: ApiEnvelope<T>
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    throw new ApiError(
      `Unexpected server response (${response.status})`,
      response.status
    )
  }

  if (!response.ok || !envelope.success || envelope.data === undefined) {
    // Token invalid/expired: clear it and force the app to log out.
    if (response.status === 401 && token) {
      notifyUnauthorized()
    }
    throw new ApiError(
      buildMessage(envelope),
      response.status,
      envelope.details
    )
  }

  return { data: envelope.data, meta: envelope.meta }
}
