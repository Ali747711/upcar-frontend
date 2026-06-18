import { useCallback, useState } from "react"

import type { Part } from "@/types/part"

function createEmptyPart(): Part {
  return {
    id: crypto.randomUUID(),
    partCode: "",
    quantity: 1,
    price: 0,
    checked: false,
  }
}

/** Fields a user can edit on a row. */
export type PartUpdate = Partial<Omit<Part, "id">>

export interface UsePartsResult {
  parts: Part[]
  addPart: () => void
  addMany: (newParts: Partial<Part>[]) => void
  updatePart: (id: string, update: PartUpdate) => void
  removePart: (id: string) => void
  resetParts: () => void
}

/**
 * Owns the parts collection with strictly immutable updates — every
 * mutation produces a new array/object so React re-renders predictably
 * and there are no hidden side effects (see coding-style rules).
 */
export function useParts(initial?: Part[]): UsePartsResult {
  const [parts, setParts] = useState<Part[]>(
    () => initial ?? [createEmptyPart()]
  )

  const addPart = useCallback(() => {
    setParts((current) => [...current, createEmptyPart()])
  }, [])

  const addMany = useCallback((newParts: Partial<Part>[]) => {
    setParts((current) => [
      ...current,
      ...newParts.map((p) => ({
        ...createEmptyPart(),
        ...p,
        id: crypto.randomUUID(),
      })),
    ])
  }, [])

  const updatePart = useCallback((id: string, update: PartUpdate) => {
    setParts((current) =>
      current.map((part) => (part.id === id ? { ...part, ...update } : part))
    )
  }, [])

  const removePart = useCallback((id: string) => {
    setParts((current) => current.filter((part) => part.id !== id))
  }, [])

  const resetParts = useCallback(() => {
    setParts([createEmptyPart()])
  }, [])

  return { parts, addPart, addMany, updatePart, removePart, resetParts }
}
