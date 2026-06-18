import { apiRequest } from "./client"

export interface LibraryPart {
  id: string
  partCode: string
  imageUrl?: string
  lastPrice?: number
}

export async function getPartLibrary(query: string = "") {
  const result = await apiRequest<LibraryPart[]>(
    `/parts-library?q=${encodeURIComponent(query)}`
  )
  return result.data
}
