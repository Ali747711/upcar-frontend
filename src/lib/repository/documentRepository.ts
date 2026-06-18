import type { DocumentDraft, SavedDocument } from "@/types/document"

/**
 * Storage-agnostic contract for persisting documents. The UI depends only
 * on this interface, so the localStorage implementation can be swapped for
 * an HTTP/API-backed one later without touching any components.
 */
export interface DocumentRepository {
  findAll(): Promise<SavedDocument[]>
  findById(id: string): Promise<SavedDocument | null>
  create(draft: DocumentDraft): Promise<SavedDocument>
  update(id: string, draft: DocumentDraft): Promise<SavedDocument>
  delete(id: string): Promise<void>
}
