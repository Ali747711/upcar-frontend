import type { ReactNode } from "react"

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** Right-aligned actions (buttons, etc.). */
  actions?: ReactNode
  /** Optional element rendered above the title (e.g. a back link). */
  eyebrow?: ReactNode
}

/** Sticky page header used across screens for a consistent SaaS layout. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: PageHeaderProps) {
  return (
    <header className="sticky top-14 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:top-0">
      <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-5">
        <div className="min-w-0">
          {eyebrow && <div className="mb-1">{eyebrow}</div>}
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground sm:line-clamp-none">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  )
}
