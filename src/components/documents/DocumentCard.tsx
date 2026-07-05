import { useNavigate } from "react-router-dom"
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, grandTotal } from "@/lib/calculations"
import type { SavedDocument } from "@/types/document"

interface DocumentCardProps {
  document: SavedDocument
  onDuplicate: (id: string) => void
  onDelete: (document: SavedDocument) => void
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ""
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function DocumentCard({
  document,
  onDuplicate,
  onDelete,
}: DocumentCardProps) {
  const navigate = useNavigate()
  const open = () => navigate(`/documents/${document.id}`)

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          open()
        }
      }}
      className="group cursor-pointer gap-0 p-0 transition-all hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {document.carName || "Untitled document"}
          </h3>
          {document.carNumber && (
            <Badge variant="secondary" className="mt-1.5 font-normal">
              {document.carNumber}
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Document actions"
              className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(event) => event.stopPropagation()}
          >
            <DropdownMenuItem onSelect={open}>
              <Pencil data-icon="inline-start" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDuplicate(document.id)}>
              <Copy data-icon="inline-start" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(document)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-auto flex items-center justify-between border-t bg-muted/30 px-5 py-3 text-sm">
        <span className="text-muted-foreground">
          {document.parts.length}{" "}
          {document.parts.length === 1 ? "part" : "parts"}
        </span>
        <span className="font-medium tabular-nums">
          {formatCurrency(grandTotal(document.parts, document.markupPercent))}
        </span>
      </div>

      <p className="px-5 pb-4 text-xs text-muted-foreground">
        Updated {formatRelative(document.updatedAt)}
      </p>
    </Card>
  )
}
