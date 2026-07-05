import { useState } from "react"
import { Check, ChevronDown, Percent } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PRESETS = [5, 10, 15, 20, 25, 30]

/** Integer percent in [1, 100], or null when the raw input isn't one. */
function parseCustomPercent(raw: string): number | null {
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
    return null
  }
  return parsed
}

interface MarkupSelectProps {
  /** Current document markup in percent (0 = none). */
  value: number
  onChange: (percent: number) => void
}

/**
 * Header control for the document's client-facing price markup. Presets plus
 * a custom integer input (1-100). The chosen percentage is applied to totals
 * in the editor/preview/PDF but is never printed in the PDF itself.
 */
export function MarkupSelect({ value, onChange }: MarkupSelectProps) {
  const [open, setOpen] = useState(false)
  const [customRaw, setCustomRaw] = useState("")

  const customValue = parseCustomPercent(customRaw)

  const applyCustom = () => {
    if (customValue === null) {
      return
    }
    onChange(customValue)
    setCustomRaw("")
    setOpen(false)
  }

  const renderCheck = (active: boolean) =>
    active ? <Check data-icon="inline-end" /> : null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Percent data-icon="inline-start" />
          <span className="hidden sm:inline">
            {value > 0 ? `+${value}%` : "Markup"}
          </span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Price markup</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange(0)}>
          None
          {renderCheck(value === 0)}
        </DropdownMenuItem>
        {PRESETS.map((preset) => (
          <DropdownMenuItem key={preset} onClick={() => onChange(preset)}>
            +{preset}%{renderCheck(value === preset)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* stopPropagation keeps DropdownMenu typeahead from stealing keystrokes */}
        <div
          className="flex items-center gap-2 p-2"
          onKeyDown={(event) => event.stopPropagation()}
        >
          <Input
            type="number"
            min={1}
            max={100}
            step={1}
            placeholder="Custom %"
            value={customRaw}
            onChange={(event) => setCustomRaw(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                applyCustom()
              }
            }}
            className="h-8"
          />
          <Button size="sm" disabled={customValue === null} onClick={applyCustom}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
