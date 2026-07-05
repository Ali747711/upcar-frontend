import { memo, useRef } from "react"
import { ImagePlus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { formatCurrency, rowTotal } from "@/lib/calculations"
import { validatePart } from "@/lib/validation"
import type { Part } from "@/types/part"
import type { PartUpdate } from "@/hooks/useParts"

interface PartCardProps {
  part: Part
  index: number
  showErrors: boolean
  uploading: boolean
  /** If true, the partCode input will auto-focus on mount (for newly added rows). */
  autoFocusPartCode?: boolean
  /** Active document markup in percent; row totals show client-facing amounts. */
  markupPercent?: number
  onChange: (id: string, update: PartUpdate) => void
  onRemove: (id: string) => void
  onImageSelect: (id: string, file: File) => void
  onEnterKey?: () => void
}

function toNumber(raw: string): number {
  if (raw.trim() === "") return 0
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function PartCardComponent({
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
}: PartCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)
  const errors = validatePart(part)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onImageSelect(part.id, file)
    event.target.value = ""
  }

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 transition-colors focus-within:bg-primary/5",
        !part.checked && "opacity-60"
      )}
    >
      {/* Top row: checkbox + image + row number + delete */}
      <div className="mb-3 flex items-center gap-3">
        <Checkbox
          aria-label={`Toggle row \${index + 1}`}
          checked={part.checked}
          onCheckedChange={(checked) =>
            onChange(part.id, { checked: checked === true })
          }
        />

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
          <div className="relative size-12 shrink-0">
            <img
              src={part.imageUrl}
              alt={part.imageName ?? "Part"}
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
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus data-icon="inline-start" />
            Image
          </Button>
        )}

        <span className="flex-1 text-xs text-muted-foreground">
          #{index + 1}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete row \${index + 1}`}
          onClick={() => onRemove(part.id)}
        >
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Part code */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-muted-foreground">
          Part Code
        </label>
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
          onChange={(e) =>
            onChange(part.id, {
              partCode: e.target.value,
            })
          }
          className="font-mono tabular-nums"
        />
      </div>

      {/* Qty + Price */}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Qty
          </label>
          <Input
            ref={quantityInputRef}
            type="number"
            min={1}
            step={1}
            value={part.quantity}
            aria-invalid={showErrors && Boolean(errors.quantity)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnterKey) {
                e.preventDefault()
                onEnterKey()
              }
            }}
            onChange={(e) =>
              onChange(part.id, { quantity: toNumber(e.target.value) })
            }
            className="tabular-nums"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Price
          </label>
          <Input
            ref={priceInputRef}
            type="number"
            min={0}
            step="0.01"
            value={part.price}
            aria-invalid={showErrors && Boolean(errors.price)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnterKey) {
                e.preventDefault()
                onEnterKey()
              }
            }}
            onChange={(e) =>
              onChange(part.id, { price: toNumber(e.target.value) })
            }
            className="tabular-nums"
          />
        </div>
      </div>

      {/* Total */}
      <div className="text-right text-sm">
        <span className="text-muted-foreground">Total: </span>
        <strong
          className={cn(
            "tabular-nums",
            !part.checked && "text-muted-foreground"
          )}
        >
          {formatCurrency(rowTotal(part, markupPercent))}
        </strong>
      </div>
    </div>
  )
}

export const PartCard = memo(PartCardComponent)
