import { useEffect, useState } from "react"
import { Search, History, Check, Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { getPartLibrary, type LibraryPart } from "@/lib/api/partLibrary"
import { formatCurrency } from "@/lib/calculations"
import { cn } from "@/lib/utils"

interface PartLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (parts: LibraryPart[]) => void
}

export function PartLibraryDialog({
  open,
  onOpenChange,
  onSelect,
}: PartLibraryDialogProps) {
  const [query, setQuery] = useState("")
  const [parts, setParts] = useState<LibraryPart[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) {
      setQuery("")
      setSelectedIds(new Set())
      return
    }

    const loadParts = async () => {
      setLoading(true)
      try {
        const data = await getPartLibrary(query)
        setParts(data)
      } catch (error) {
        console.error("Failed to load part library", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(loadParts, 300)
    return () => clearTimeout(timer)
  }, [open, query])

  const toggleSelection = (part: LibraryPart) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(part.id)) {
        next.delete(part.id)
      } else {
        next.add(part.id)
      }
      return next
    })
  }

  const handleConfirm = () => {
    const selectedParts = parts.filter((p) => selectedIds.has(p.id))
    onSelect(selectedParts)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Part Library
          </DialogTitle>
          <DialogDescription>
            Choose from parts you've used in previous documents.
          </DialogDescription>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by part code..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="flex flex-col min-h-[400px]">
          <ScrollArea className="flex-1 max-h-[450px]">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Spinner className="size-8" />
              </div>
            ) : parts.length === 0 ? (
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyTitle>No history yet</EmptyTitle>
                  <EmptyDescription>
                    {query ? "No parts match your search." : "Parts you use will automatically appear here."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 divide-y">
                {parts.map((part) => {
                  const isSelected = selectedIds.has(part.id)
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => toggleSelection(part)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-3 text-left transition-colors hover:bg-muted/50",
                        isSelected && "bg-primary/5 hover:bg-primary/10"
                      )}
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/20">
                        {part.imageUrl ? (
                          <img
                            src={part.imageUrl}
                            alt={part.partCode}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <History className="size-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-semibold tracking-tight">
                          {part.partCode}
                        </p>
                        {part.lastPrice !== undefined && (
                          <p className="text-xs text-muted-foreground">
                            Last price: {formatCurrency(part.lastPrice)}
                          </p>
                        )}
                      </div>

                      <div className={cn(
                        "flex size-6 items-center justify-center rounded-full border transition-all",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "text-transparent"
                      )}>
                        <Check className="size-3.5" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between gap-4 border-t px-6 py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            {selectedIds.size} {selectedIds.size === 1 ? 'part' : 'parts'} selected
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              disabled={selectedIds.size === 0}
              onClick={handleConfirm}
            >
              <Plus data-icon="inline-start" />
              Add to document
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
