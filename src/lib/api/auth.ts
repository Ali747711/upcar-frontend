import { apiRequest } from "./client"
import type { AuthData, User } from "@/types/auth"

export async function login(credentials: { email: string; password: string }) {
  const result = await apiRequest<AuthData>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
  return result.data
}

export async function register(data: {
  email: string
  password: string
  name?: string
}) {
  const result = await apiRequest<AuthData>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
  return result.data
}

export async function getMe() {
  const result = await apiRequest<User>("/auth/me")
  return result.data
}
