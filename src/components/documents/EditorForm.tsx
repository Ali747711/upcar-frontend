import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileText,
  Save,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { PageHeader } from "@/components/layout/PageHeader"
import { CarInfoForm } from "@/components/parts/CarInfoForm"
import { PartsTable } from "@/components/parts/PartsTable"
import { PreviewDialog } from "@/components/PreviewDialog"
import { useParts } from "@/hooks/useParts"
import { deleteUploadedImage, uploadImage } from "@/lib/api/upload"
import { generatePdf } from "@/lib/api"
import { documentRepository } from "@/lib/repository"
import { validateDocument } from "@/lib/validation"
import type { CarInfo, Part } from "@/types/part"
import type { DocumentDraft } from "@/types/document"

type PdfFilterMode = "all" | "checked" | "unchecked"

const PDF_FILTER_LABELS: Record<PdfFilterMode, string> = {
  all: "All parts",
  checked: "Checked parts only",
  unchecked: "Unchecked parts only",
}

// "All parts" lists checked parts first (then unchecked), preserving each
// group's relative order. The filtered modes return only the matching parts.
function applyFilter(parts: Part[], mode: PdfFilterMode): Part[] {
  switch (mode) {
    case "checked":
      return parts.filter((p) => p.checked)
    case "unchecked":
      return parts.filter((p) => !p.checked)
    case "all":
    default:
      return [
        ...parts.filter((p) => p.checked),
        ...parts.filter((p) => !p.checked),
      ]
  }
}

interface EditorFormProps {
  /** Existing document id, or null when creating a new one. */
  documentId: string | null
  initialCarInfo: CarInfo
  initialParts: Part[]
}

function snapshot(carInfo: CarInfo, parts: Part[]): string {
  return JSON.stringify({ carInfo, parts })
}

export function EditorForm({
  documentId,
  initialCarInfo,
  initialParts,
}: EditorFormProps) {
  const navigate = useNavigate()
  const [carInfo, setCarInfo] = useState<CarInfo>(initialCarInfo)
  const { parts, addPart, addMany, updatePart, removePart } =
    useParts(initialParts)

  const [showErrors, setShowErrors] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  /** Ids of rows whose image is currently uploading to Cloudinary. */
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set())
  /** Snapshot of the last persisted state, for dirty tracking. */
  const [savedState, setSavedState] = useState(() =>
    snapshot(initialCarInfo, initialParts)
  )

  const dirty = useMemo(
    () => snapshot(carInfo, parts) !== savedState,
    [carInfo, parts, savedState]
  )

  // Warn before leaving with unsaved changes (tab close / reload).
  useEffect(() => {
    if (!dirty) {
      return
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  const setUploading = useCallback((id: string, value: boolean) => {
    setUploadingIds((current) => {
      const next = new Set(current)
      if (value) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const handleImageSelect = useCallback(
    async (id: string, file: File) => {
      setUploading(id, true)
      try {
        const { url, publicId } = await uploadImage(file)
        updatePart(id, {
          imageUrl: url,
          imagePublicId: publicId,
          imageName: file.name,
        })
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not upload image"
        )
      } finally {
        setUploading(id, false)
      }
    },
    [updatePart, setUploading]
  )

  const handleRemovePart = useCallback(
    async (id: string) => {
      const part = parts.find((p) => p.id === id)
      const newParts = parts.filter((p) => p.id !== id)

      removePart(id)

      // Fire-and-forget — orphaned Cloudinary images are worse than a lost
      // error message here.
      if (part?.imagePublicId) {
        deleteUploadedImage(part.imagePublicId).catch(() => {})
      }

      // Auto-save to remove the part from MongoDB immediately. Silent: if it
      // fails (e.g. other rows still invalid) the user just sees "Unsaved
      // changes" and can save manually.
      if (documentId) {
        try {
          await documentRepository.update(documentId, {
            ...carInfo,
            parts: newParts,
          })
          setSavedState(snapshot(carInfo, newParts))
        } catch {
          // intentionally silent
        }
      }
    },
    [parts, carInfo, documentId, removePart]
  )

  const ensureValid = useCallback((): boolean => {
    const result = validateDocument(carInfo, parts)
    if (!result.valid) {
      setShowErrors(true)
      toast.error(result.reason ?? "Please complete the form")
      return false
    }
    return true
  }, [carInfo, parts])

  const handleSave = useCallback(async () => {
    // The backend validates strictly, so block invalid saves up front.
    if (!ensureValid()) {
      return
    }
    setSaving(true)
    try {
      const draft: DocumentDraft = { ...carInfo, parts }
      if (documentId) {
        await documentRepository.update(documentId, draft)
        setSavedState(snapshot(carInfo, parts))
        toast.success("Changes saved")
      } else {
        const created = await documentRepository.create(draft)
        setSavedState(snapshot(carInfo, parts))
        toast.success("Document saved")
        navigate(`/documents/${created.id}`, { replace: true })
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the document"
      )
    } finally {
      setSaving(false)
    }
  }, [carInfo, parts, documentId, navigate, ensureValid])

  const handlePreview = () => {
    if (ensureValid()) {
      setPreviewOpen(true)
    }
  }

  const handleGenerate = useCallback(
    async (mode: PdfFilterMode = "all") => {
      if (!ensureValid()) {
        return
      }
      setGenerating(true)
      try {
        const filteredParts = applyFilter(parts, mode)
        await generatePdf({ ...carInfo, parts: filteredParts })
        toast.success("PDF generated")
        setPreviewOpen(false)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "PDF generation failed"
        )
      } finally {
        setGenerating(false)
      }
    },
    [carInfo, parts, ensureValid]
  )

  return (
    <>
      <PageHeader
        eyebrow={
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-1 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Documents
          </button>
        }
        title={carInfo.carName || "Untitled document"}
        description={
          dirty ? (
            <span className="text-amber-600 dark:text-amber-500">
              Unsaved changes
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Check className="size-3.5" /> All changes saved
            </span>
          )
        }
        actions={
          <>
            <Button variant="ghost" onClick={handlePreview}>
              <FileText data-icon="inline-start" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={generating}>
                  {generating ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <Download data-icon="inline-start" />
                  )}
                  <span className="hidden sm:inline">Generate PDF</span>
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Include parts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(
                  Object.entries(PDF_FILTER_LABELS) as [PdfFilterMode, string][]
                ).map(([mode, label]) => (
                  <DropdownMenuItem
                    key={mode}
                    onClick={() => handleGenerate(mode)}
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-4 lg:px-8">
        <div className="shrink-0">
          <CarInfoForm value={carInfo} onChange={setCarInfo} />
        </div>
        <PartsTable
          parts={parts}
          showErrors={showErrors}
          uploadingIds={uploadingIds}
          onAdd={addPart}
          onAddMany={addMany}
          onChange={updatePart}
          onRemove={handleRemovePart}
          onImageSelect={handleImageSelect}
        />
      </div>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        carInfo={carInfo}
        // Preview the exact "All parts" order (checked first) the PDF will use.
        parts={applyFilter(parts, "all")}
        generating={generating}
        onGenerate={handleGenerate}
      />
    </>
  )
}
