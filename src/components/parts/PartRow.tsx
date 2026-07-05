import { memo, useRef } from "react"
import { ImagePlus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrency, rowTotal } from "@/lib/calculations"
import { validatePart } from "@/lib/validation"
import type { Part } from "@/types/part"
import type { PartUpdate } from "@/hooks/useParts"

interface PartRowProps {
  part: Part
  index: number
  /** Surface validation errors only once the user has tried to submit. */
  showErrors: boolean
  /** True while this row's image is uploading to Cloudinary. */
  uploading: boolean
  /** If true, the partCode input will auto-focus on mount (for newly added rows). */
  autoFocusPartCode?: boolean
  /** Active document markup in percent; row totals show client-facing amounts. */
  markupPercent?: number
  onChange: (id: string, update: PartUpdate) => void
  onRemove: (id: string) => void
  onImageSelect: (id: string, file: File) => void
  onEnterKey: () => void
}

/** Parse a numeric input, treating empty/NaN as 0 for storage. */
function toNumber(raw: string): number {
  if (raw.trim() === "") {
    return 0
  }
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function PartRowComponent({
  part,
  index,
  showErrors,
  uploading,
  autoFocusPartCode,
  markupPercent = 0,
  onChange,
  onRemove,
  onImageSelect,
  onEnterKey,
}: PartRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const errors = validatePart(part)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelect(part.id, file)
    }
    // Allow re-selecting the same file later.
    event.target.value = ""
  }

  return (
    <TableRow
      data-state={part.checked ? undefined : "muted"}
      // Highlight the row being edited (any cell focused) with the accent
      // tint, distinct from the plain gray hover, so the user always knows
      // which row they're in.
      className="focus-within:bg-primary/5 hover:focus-within:bg-primary/20"
    >
      <TableCell className="text-center align-middle">
        <Checkbox
          aria-label={`Toggle row ${index + 1}`}
          checked={part.checked}
          onCheckedChange={(checked) =>
            onChange(part.id, { checked: checked === true })
          }
        />
      </TableCell>

      <TableCell>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading ? (
          <div className="flex size-12 items-center justify-center rounded-md border">
            <Spinner />
          </div>
        ) : part.imageUrl ? (
          <div className="relative size-12">
            <img
              src={part.imageUrl}
              alt={part.imageName ?? "Part preview"}
              className="size-12 rounded-md border object-cover"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() =>
                onChange(part.id, { imageUrl: undefined, imageName: undefined })
              }
              className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-white"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus data-icon="inline-start" />
            Upload
          </Button>
        )}
      </TableCell>

      <TableCell>
        <Input
          autoFocus={autoFocusPartCode}
          placeholder="Part Code"
          value={part.partCode}
          aria-invalid={showErrors && Boolean(errors.partCode)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              quantityInputRef.current?.focus()
            }
          }}
          onChange={(event) =>
            onChange(part.id, {
              partCode: event.target.value,
            })
          }
          className="font-mono tabular-nums"
        />
      </TableCell>

      <TableCell>
        <Input
          ref={quantityInputRef}
          type="number"
          min={1}
          step={1}
          value={part.quantity}
          aria-invalid={showErrors && Boolean(errors.quantity)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onEnterKey()
            }
          }}
          onChange={(event) =>
            onChange(part.id, { quantity: toNumber(event.target.value) })
          }
          className="text-right tabular-nums"
        />
      </TableCell>

      <TableCell>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={part.price}
          aria-invalid={showErrors && Boolean(errors.price)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onEnterKey()
            }
          }}
          onChange={(event) =>
            onChange(part.id, { price: toNumber(event.target.value) })
          }
          className="text-right tabular-nums"
        />
      </TableCell>

      <TableCell
        className={cn(
          "text-right font-medium tabular-nums",
          !part.checked && "text-muted-foreground"
        )}
      >
        {formatCurrency(rowTotal(part, markupPercent))}
      </TableCell>

      <TableCell className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete row ${index + 1}`}
          onClick={() => onRemove(part.id)}
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

/** Memoized so editing one row in a 100+ row table doesn't re-render the rest. */
export const PartRow = memo(PartRowComponent)
