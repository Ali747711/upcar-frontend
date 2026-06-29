import type { CarInfo, Part } from "@/types/part"
import { formatCurrency, grandTotal, rowTotal } from "@/lib/calculations"

import "./document.css"

interface PartsDocumentProps {
  carInfo: CarInfo
  parts: Part[]
  /** ISO date string; defaults to today. */
  date?: string
}

/** Max parts per column, and per page (two columns side by side). */
const ROWS_PER_COLUMN = 9
const ROWS_PER_PAGE = ROWS_PER_COLUMN * 2 // 18

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size))
  }
  return pages
}

function formatDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) {
    return iso
  }
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function PartEntry({ part }: { part: Part }) {
  return (
    <div className="doc__entry">
      <span className="doc__entry-check">{part.checked ? "☑" : "☐"}</span>
      {part.imageUrl ? (
        <img
          className="doc__entry-img"
          src={part.imageUrl}
          alt={part.partCode || "Part"}
        />
      ) : (
        <span className="doc__entry-img doc__entry-img--empty">No image</span>
      )}
      <div className="doc__entry-info">
        <div className="doc__entry-code">{part.partCode || "—"}</div>
        <div className="doc__entry-nums">
          Qty {part.quantity} × {formatCurrency(part.price)} ={" "}
          <span className="doc__entry-total">
            {formatCurrency(rowTotal(part))}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Renders the exact document that the backend turns into a PDF. This is the
 * shared layout used by the in-app preview; the markup + document.css are the
 * single source of truth (see project CLAUDE.md). Parts flow into two columns
 * of up to 9 rows per page (18 per page), divided by a vertical line.
 */
export function PartsDocument({ carInfo, parts, date }: PartsDocumentProps) {
  const documentDate = date ?? new Date().toISOString()
  const total = grandTotal(parts)
  const pages = chunk(parts, ROWS_PER_PAGE)

  return (
    <article className="doc">
      <header className="doc__header">
        <div>
          <h1 className="doc__title">{carInfo.carName || "—"}</h1>
          <p className="doc__subtitle">{carInfo.carNumber || "—"}</p>
        </div>
        <div className="doc__meta">
          <div>
            <span className="doc__meta-label">Date:</span>{" "}
            {formatDate(documentDate)}
          </div>
          <div>Upcar Group</div>
        </div>
      </header>

      {pages.map((page, pageIndex) => (
        <section className="doc__page" key={pageIndex}>
          <div className="doc__columns">
            <div className="doc__column">
              {page.slice(0, ROWS_PER_COLUMN).map((part) => (
                <PartEntry key={part.id} part={part} />
              ))}
            </div>
            <div className="doc__divider" />
            <div className="doc__column">
              {page.slice(ROWS_PER_COLUMN).map((part) => (
                <PartEntry key={part.id} part={part} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <footer className="doc__footer">
        <div className="doc__summary-item">
          Total items: <strong>{parts.length}</strong>
        </div>
        <div className="doc__grand-total">
          <div className="doc__grand-total-label">Grand Total</div>
          <div className="doc__grand-total-value">{formatCurrency(total)}</div>
        </div>
      </footer>
    </article>
  )
}
