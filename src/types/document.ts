import type { Part } from "@/types/part"

/** A persisted parts-inspection document. */
export interface SavedDocument {
  id: string
  carName: string
  carNumber: string
  /** Client-facing price markup in percent (0 = none). Base prices stay untouched. */
  markupPercent: number
  parts: Part[]
  /** ISO timestamps. */
  createdAt: string
  updatedAt: string
}

/** Fields supplied when creating/updating a document (timestamps are managed). */
export type DocumentDraft = Pick<
  SavedDocument,
  "carName" | "carNumber" | "markupPercent" | "parts"
>
