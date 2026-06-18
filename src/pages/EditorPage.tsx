import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { EditorForm } from "@/components/documents/EditorForm"
import { documentRepository } from "@/lib/repository"
import type { Part } from "@/types/part"
import type { SavedDocument } from "@/types/document"

function blankPart(): Part {
  return {
    id: crypto.randomUUID(),
    partCode: "",
    quantity: 1,
    price: 0,
    checked: true,
  }
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; document: SavedDocument | null }
  | { status: "not-found" }

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>(
    id ? { status: "loading" } : { status: "ready", document: null }
  )

  useEffect(() => {
    if (!id) {
      setState({ status: "ready", document: null })
      return
    }

    let active = true
    setState({ status: "loading" })
    documentRepository
      .findById(id)
      .then((document) => {
        if (!active) {
          return
        }
        setState(
          document ? { status: "ready", document } : { status: "not-found" }
        )
      })
      .catch(() => {
        if (active) {
          setState({ status: "not-found" })
        }
      })

    return () => {
      active = false
    }
  }, [id])

  if (state.status === "loading") {
    return (
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6 overflow-auto px-6 py-6 lg:px-8">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (state.status === "not-found") {
    return (
      <Empty className="mt-24">
        <EmptyHeader>
          <EmptyTitle>Document not found</EmptyTitle>
          <EmptyDescription>
            It may have been deleted or the link is incorrect.
          </EmptyDescription>
        </EmptyHeader>
        <Button onClick={() => navigate("/")}>Back to documents</Button>
      </Empty>
    )
  }

  const { document } = state

  return (
    <EditorForm
      // Remount when switching documents so editor state resets cleanly.
      key={document?.id ?? "new"}
      documentId={document?.id ?? null}
      initialCarInfo={{
        carName: document?.carName ?? "",
        carNumber: document?.carNumber ?? "",
      }}
      initialParts={
        document && document.parts.length > 0 ? document.parts : [blankPart()]
      }
    />
  )
}
