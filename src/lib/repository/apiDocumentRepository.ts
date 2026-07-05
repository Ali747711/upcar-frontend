import { ApiError, apiRequest } from "@/lib/api/client"
import { MAX_PAGE_SIZE } from "@/lib/constants"
import type { DocumentRepository } from "@/lib/repository/documentRepository"
import type { DocumentDraft, SavedDocument } from "@/types/document"
import type { Part } from "@/types/part"

/** Shape of a part as returned by the backend (no client-only fields). */
interface ApiPart {
  partCode: string
  quantity: number
  price: number
  checked: boolean
  imageUrl?: string
  imagePublicId?: string
}

/** Shape of a document as returned by the backend. */
interface ApiDocument {
  id: string
  carName: string
  carNumber: string
  markupPercent?: number
  parts: ApiPart[]
  createdAt: string
  updatedAt: string
}

/** Backend parts carry no `id`; assign a stable client id for React keys. */
function toClientDocument(doc: ApiDocument): SavedDocument {
  return {
    id: doc.id,
    carName: doc.carName,
    carNumber: doc.carNumber,
    // Documents saved before the markup feature have no field → 0%.
    markupPercent: doc.markupPercent ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    parts: doc.parts.map((part) => ({
      ...part,
      id: crypto.randomUUID(),
    })),
  }
}

/** Strip client-only fields (`id`, `imageName`) down to the backend contract. */
function toApiPart(part: Part): ApiPart {
  const apiPart: ApiPart = {
    partCode: part.partCode,
    quantity: part.quantity,
    price: part.price,
    checked: part.checked,
  }
  if (part.imageUrl) apiPart.imageUrl = part.imageUrl
  if (part.imagePublicId) apiPart.imagePublicId = part.imagePublicId
  return apiPart
}

function toApiBody(draft: DocumentDraft) {
  return {
    carName: draft.carName,
    carNumber: draft.carNumber,
    markupPercent: draft.markupPercent,
    parts: draft.parts.map(toApiPart),
  }
}

/**
 * Talks to the backend REST API (Express + MongoDB). Maps between the
 * backend document shape and the client {@link SavedDocument} shape so the
 * rest of the app is unaware of the transport.
 */
export class ApiDocumentRepository implements DocumentRepository {
  async findAll(): Promise<SavedDocument[]> {
    // Single page sized to the backend's max; add real pagination later.
    const { data } = await apiRequest<ApiDocument[]>(
      `/documents?page=1&limit=${MAX_PAGE_SIZE}`
    )
    return data.map(toClientDocument)
  }

  async findById(id: string): Promise<SavedDocument | null> {
    try {
      const { data } = await apiRequest<ApiDocument>(`/documents/${id}`)
      return toClientDocument(data)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw error
    }
  }

  async create(draft: DocumentDraft): Promise<SavedDocument> {
    const { data } = await apiRequest<ApiDocument>("/documents", {
      method: "POST",
      body: JSON.stringify(toApiBody(draft)),
    })
    return toClientDocument(data)
  }

  async update(id: string, draft: DocumentDraft): Promise<SavedDocument> {
    const { data } = await apiRequest<ApiDocument>(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(toApiBody(draft)),
    })
    return toClientDocument(data)
  }

  async delete(id: string): Promise<void> {
    await apiRequest<{ id: string; deleted: boolean }>(`/documents/${id}`, {
      method: "DELETE",
    })
  }
}
