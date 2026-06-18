import type { DocumentRepository } from "@/lib/repository/documentRepository"
import { ApiDocumentRepository } from "@/lib/repository/apiDocumentRepository"

/**
 * The app-wide repository instance, backed by the Express + MongoDB API.
 * Swap this single line for another implementation (e.g. the localStorage
 * one) without touching any components.
 */
export const documentRepository: DocumentRepository =
  new ApiDocumentRepository()

export type { DocumentRepository }
