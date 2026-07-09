import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

export default function HistoryPagination({ page, limit, total, onPageChange }: Props) {
  // Guard against a bad/zero limit from the API — divide-by-zero would yield
  // Infinity/NaN and break the page math and prev/next logic.
  const safeLimit = Math.max(1, limit)
  const totalPages = Math.max(1, Math.ceil(total / safeLimit))
  const hasPrev = page > 1
  const hasNext = page < totalPages

  if (total === 0) return null

  const start = (page - 1) * safeLimit + 1
  const end = Math.min(page * safeLimit, total)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        Showing {start}–{end} of {total}
      </p>

      <div className="flex items-center gap-2">
        <PageButton disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
          Previous
        </PageButton>
        <span className="text-muted-foreground text-sm">
          Page {page} of {totalPages}
        </span>
        <PageButton disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
          Next
        </PageButton>
      </div>
    </div>
  )
}

type PageButtonProps = {
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function PageButton({ disabled, onClick, children }: PageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'border-border rounded-md border px-3 py-1.5 text-sm transition-colors',
        disabled ? 'text-muted-foreground cursor-not-allowed opacity-50' : 'hover:bg-muted'
      )}
    >
      {children}
    </button>
  )
}
