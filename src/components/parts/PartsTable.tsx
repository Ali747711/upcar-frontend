import { useMemo, useState } from "react"
import { Plus, Search, History, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { formatCurrency, grandTotal } from "@/lib/calculations"
import type { Part } from "@/types/part"
import type { PartUpdate } from "@/hooks/useParts"
import { PartCard } from "@/components/parts/PartCard"
import { PartRow } from "@/components/parts/PartRow"
import { PartLibraryDialog } from "./PartLibraryDialog"
import type { LibraryPart } from "@/lib/api/partLibrary"

interface PartsTableProps {
  parts: Part[]
  showErrors: boolean
  /** Ids of rows whose image is currently uploading. */
  uploadingIds: Set<string>
  onAdd: () => void
  onAddMany: (parts: Partial<Part>[]) => void
  onChange: (id: string, update: PartUpdate) => void
  onRemove: (id: string) => void
  onImageSelect: (id: string, file: File) => void
}

export function PartsTable({
  parts,
  showErrors,
  uploadingIds,
  onAdd,
  onAddMany,
  onChange,
  onRemove,
  onImageSelect,
}: PartsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [libraryOpen, setLibraryOpen] = useState(false)

  const filteredParts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return parts
    return parts.filter((part) => part.partCode.toLowerCase().includes(query))
  }, [parts, searchQuery])

  const total = grandTotal(parts)
  const checkedCount = parts.filter((part) => part.checked).length

  const handleLibrarySelect = (selected: LibraryPart[]) => {
    const newParts = selected.map((p) => ({
      partCode: p.partCode,
      imageUrl: p.imageUrl,
      price: p.lastPrice ?? 0,
      quantity: 1,
      checked: false,
    }))
    onAddMany(newParts)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center">
          <CardTitle>Parts</CardTitle>
          <CardAction className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="relative flex-1 sm:min-w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by part code…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pr-9 pl-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm bg-muted p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLibraryOpen(true)}
              >
                <History data-icon="inline-start" />
                From library
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  onAdd()
                }}
              >
                <Plus data-icon="inline-start" />
                Add row
              </Button>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          {parts.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No parts yet</EmptyTitle>
                <EmptyDescription>
                  Add your first part to start building the sheet.
                </EmptyDescription>
              </EmptyHeader>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLibraryOpen(true)}
                >
                  <History data-icon="inline-start" />
                  Select from library
                </Button>
                <Button size="sm" onClick={onAdd}>
                  <Plus data-icon="inline-start" />
                  Add row
                </Button>
              </div>
            </Empty>
          ) : filteredParts.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyTitle>No parts found</EmptyTitle>
                <EmptyDescription>
                  No parts match “{searchQuery}”.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            </Empty>
          ) : (
            <>
              {/* Mobile: card list (hidden on lg+) */}
              <div className="flex flex-col gap-3 lg:hidden">
                {filteredParts.map((part, index) => {
                  const originalIndex = parts.findIndex((p) => p.id === part.id)
                  return (
                    <PartCard
                      key={part.id}
                      part={part}
                      index={originalIndex}
                      showErrors={showErrors}
                      uploading={uploadingIds.has(part.id)}
                      autoFocusPartCode={
                        index === filteredParts.length - 1 && !searchQuery
                      }
                      onChange={onChange}
                      onRemove={onRemove}
                      onImageSelect={onImageSelect}
                      onEnterKey={onAdd}
                    />
                  )
                })}
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={onAdd}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <Plus className="size-4" />
                    Add row
                  </button>
                )}
              </div>

              {/* Desktop: table (hidden below lg) */}
              <Table containerClassName="hidden lg:block">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">Checked</TableHead>
                    <TableHead className="w-24">Image</TableHead>
                    <TableHead className="min-w-44">Part Code</TableHead>
                    <TableHead className="w-28 text-right">Quantity</TableHead>
                    <TableHead className="w-32 text-right">Price</TableHead>
                    <TableHead className="w-32 text-right">Total</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParts.map((part, index) => {
                    const originalIndex = parts.findIndex(
                      (p) => p.id === part.id
                    )
                    return (
                      <PartRow
                        key={part.id}
                        part={part}
                        index={originalIndex}
                        showErrors={showErrors}
                        uploading={uploadingIds.has(part.id)}
                        autoFocusPartCode={
                          index === filteredParts.length - 1 && !searchQuery
                        }
                        onChange={onChange}
                        onRemove={onRemove}
                        onImageSelect={onImageSelect}
                        onEnterKey={onAdd}
                      />
                    )
                  })}
                  {!searchQuery && (
                    <TableRow className="hover:bg-transparent" onClick={onAdd}>
                      <TableCell
                        colSpan={7}
                        className="cursor-pointer py-3 text-center text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Plus className="size-3.5" />
                          Add row
                        </span>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>

        {parts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t px-6 py-4 text-sm">
            <div className="flex gap-6 text-muted-foreground">
              <span>
                Items:{" "}
                <strong className="text-foreground">{parts.length}</strong>
              </span>
              <span>
                Checked:{" "}
                <strong className="text-foreground">{checkedCount}</strong>
              </span>
            </div>
            <div className="text-muted-foreground">
              Grand total:{" "}
              <strong className="text-lg text-foreground tabular-nums">
                {formatCurrency(total)}
              </strong>
            </div>
          </div>
        )}
      </Card>

      <PartLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        onSelect={handleLibrarySelect}
      />

      {/* FAB — only shown when there are enough rows that the top button scrolls off screen */}
      {parts.length > 4 && (
        <Button
          type="button"
          size="icon"
          className="fixed right-6 bottom-6 z-20 size-12 rounded-full shadow-lg"
          onClick={() => {
            setSearchQuery("")
            onAdd()
          }}
          aria-label="Add row"
        >
          <Plus className="size-5" />
        </Button>
      )}
    </>
  )
}
