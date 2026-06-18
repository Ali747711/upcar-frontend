import { useCallback, useEffect, useState } from "react"

import { documentRepository } from "@/lib/repository"
import type { DocumentDraft, SavedDocument } from "@/types/document"

export interface UseDocumentsResult {
  documents: SavedDocument[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  remove: (id: string) => Promise<void>
  duplicate: (id: string) => Promise<SavedDocument | null>
}

/**
 * Reactive view over the document repository for list/library screens.
 * Keeps local state in sync after every mutation so the UI updates without
 * a manual reload.
 */
export function useDocuments(): UseDocumentsResult {
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDocuments(await documentRepository.findAll())
    } catch {
      setError("Could not load your documents")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const remove = useCallback(async (id: string) => {
    await documentRepository.delete(id)
    setDocuments((current) => current.filter((doc) => doc.id !== id))
  }, [])

  const duplicate = useCallback(
    async (id: string): Promise<SavedDocument | null> => {
      const original = await documentRepository.findById(id)
      if (!original) {
        return null
      }

      const draft: DocumentDraft = {
        carName: original.carName ? `${original.carName} (copy)` : "",
        carNumber: original.carNumber,
        // New ids per part so the copy is fully independent.
        parts: original.parts.map((part) => ({
          ...part,
          id: crypto.randomUUID(),
        })),
      }
      const created = await documentRepository.create(draft)
      setDocuments((current) => [created, ...current])
      return created
    },
    []
  )

  return { documents, loading, error, refresh, remove, duplicate }
}
