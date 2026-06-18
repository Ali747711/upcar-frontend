import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { PartsDocument } from "@/components/document/PartsDocument"
import type { CarInfo, Part } from "@/types/part"

interface PreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carInfo: CarInfo
  parts: Part[]
  generating: boolean
  onGenerate: () => void
}

export function PreviewDialog({
  open,
  onOpenChange,
  carInfo,
  parts,
  generating,
  onGenerate,
}: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Document Preview</DialogTitle>
          <DialogDescription>
            This is exactly how the generated PDF will look.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted p-6">
          <div className="mx-auto w-fit bg-white shadow-sm">
            <PartsDocument carInfo={carInfo} parts={parts} />
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button type="button" onClick={onGenerate} disabled={generating}>
            {generating ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Download data-icon="inline-start" />
            )}
            {generating ? "Generating…" : "Generate PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
