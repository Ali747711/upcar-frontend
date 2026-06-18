import type { DocumentDraft, SavedDocument } from "@/types/document"
import type { DocumentRepository } from "@/lib/repository/documentRepository"

const STORAGE_KEY = "jq-auto.documents"

function readAll(): SavedDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedDocument[]) : []
  } catch {
    // Corrupt storage shouldn't crash the app — start clean.
    return []
  }
}

function writeAll(documents: SavedDocument[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
}

/**
 * Persists documents in the browser's localStorage. Methods are async to
 * match the {@link DocumentRepository} contract so a remote implementation
 * is a drop-in replacement.
 */
export class LocalStorageDocumentRepository implements DocumentRepository {
  async findAll(): Promise<SavedDocument[]> {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async findById(id: string): Promise<SavedDocument | null> {
    return readAll().find((doc) => doc.id === id) ?? null
  }

  async create(draft: DocumentDraft): Promise<SavedDocument> {
    const now = new Date().toISOString()
    const document: SavedDocument = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    writeAll([document, ...readAll()])
    return document
  }

  async update(id: string, draft: DocumentDraft): Promise<SavedDocument> {
    const documents = readAll()
    const existing = documents.find((doc) => doc.id === id)
    if (!existing) {
      throw new Error("Document not found")
    }

    const updated: SavedDocument = {
      ...existing,
      ...draft,
      updatedAt: new Date().toISOString(),
    }
    writeAll(documents.map((doc) => (doc.id === id ? updated : doc)))
    return updated
  }

  async delete(id: string): Promise<void> {
    writeAll(readAll().filter((doc) => doc.id !== id))
  }
}
