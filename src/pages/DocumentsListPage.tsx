import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilePlus2, FileText, Search } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/PageHeader"
import { DocumentCard } from "@/components/documents/DocumentCard"
import { useDocuments } from "@/hooks/useDocuments"
import type { SavedDocument } from "@/types/document"

export function DocumentsListPage() {
  const navigate = useNavigate()
  const { documents, loading, remove, duplicate } = useDocuments()
  const [query, setQuery] = useState("")
  const [pendingDelete, setPendingDelete] = useState<SavedDocument | null>(null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      return documents
    }
    return documents.filter(
      (doc) =>
        doc.carName.toLowerCase().includes(term) ||
        doc.carNumber.toLowerCase().includes(term)
    )
  }, [documents, query])

  const handleDuplicate = async (id: string) => {
    const copy = await duplicate(id)
    if (copy) {
      toast.success("Document duplicated")
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return
    }
    const name = pendingDelete.carName || "Document"
    await remove(pendingDelete.id)
    setPendingDelete(null)
    toast.success(`${name} deleted`)
  }

  return (
    <>
      <PageHeader
        title="Documents"
        description="Create, manage, and revisit your parts inspection sheets."
        actions={
          <Button onClick={() => navigate("/documents/new")}>
            <FilePlus2 data-icon="inline-start" />
            New document
          </Button>
        }
      />

      <div className="flex-1 px-6 py-6 lg:px-8">
        {!loading && documents.length > 0 && (
          <div className="relative mb-6 max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by car name or number…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Empty className="mt-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No documents yet</EmptyTitle>
              <EmptyDescription>
                Create your first parts inspection sheet to get started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => navigate("/documents/new")}>
                <FilePlus2 data-icon="inline-start" />
                New document
              </Button>
            </EmptyContent>
          </Empty>
        ) : filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No documents match “{query}”.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDuplicate={handleDuplicate}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.carName || "Untitled document"}” will be
              permanently removed. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
