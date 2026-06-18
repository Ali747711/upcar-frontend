import type { Part } from "@/types/part"

/** A persisted parts-inspection document. */
export interface SavedDocument {
  id: string
  carName: string
  carNumber: string
  parts: Part[]
  /** ISO timestamps. */
  createdAt: string
  updatedAt: string
}

/** Fields supplied when creating/updating a document (timestamps are managed). */
export type DocumentDraft = Pick<
  SavedDocument,
  "carName" | "carNumber" | "parts"
>
