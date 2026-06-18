/**
 * Single source of truth for the auth token in localStorage. Centralizing the
 * key (rather than scattering the "auth_token" string) keeps the API client,
 * the PDF/upload fetch helpers, and the AuthProvider in sync.
 */
const TOKEN_KEY = "auth_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Event dispatched whenever the server rejects our token (401). The
 * AuthProvider listens for it to force a logout + redirect, so an expired
 * token never leaves the app in a half-authenticated state.
 */
export const UNAUTHORIZED_EVENT = "auth:unauthorized"

/** Clear the stored token and notify the app that the session ended. */
export function notifyUnauthorized(): void {
  clearToken()
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
}
