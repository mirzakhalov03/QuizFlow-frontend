import { useState } from 'react'
import { ArrowUpDown, Check, SlidersHorizontal } from 'lucide-react'

import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SortOption, StatusFilter } from '@/hooks/useQuizListControls'
import { useClickOutside } from '@/hooks/useClickOutside'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/types/quiz'
import { questionTypes } from '@/components/main/quizzes/utils'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
]

// All quiz types the backend can store and filter on. Mixed quizzes persist
// type 'mixed', so it's a valid filter value alongside the single types.
const FILTERABLE_TYPES = questionTypes

type Props = {
  search: string
  onSearchChange: (search: string) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  filterTypes: QuestionType[]
  onToggleFilter: (type: QuestionType) => void
  statusFilter: StatusFilter | undefined
  onToggleStatus: (status: StatusFilter) => void
}

export function QuizToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filterTypes,
  onToggleFilter,
  statusFilter,
  onToggleStatus,
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="w-full sm:flex-1">
        <Input
          type="search"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
        />
      </div>
      <div className="flex w-full gap-2 sm:w-auto sm:flex-none">
        <SortDropdown sort={sort} onChange={onSortChange} className="flex-1 sm:flex-none" />
        <FilterDropdown
          filterTypes={filterTypes}
          onToggle={onToggleFilter}
          statusFilter={statusFilter}
          onToggleStatus={onToggleStatus}
          className="flex-1 sm:flex-none"
        />
      </div>
    </div>
  )
}

function SortDropdown({
  sort,
  onChange,
  className,
}: {
  sort: SortOption
  onChange: (s: SortOption) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort'

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        variant="outline"
        size="md"
        onClick={() => setOpen((o) => !o)}
        className="w-full gap-1.5 cursor-pointer"
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        {currentLabel}
      </Button>

      {open && (
        <div className="bg-popover text-popover-foreground border-border absolute right-0 z-50 mt-1 min-w-40 rounded-md border shadow-lg">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors',
                opt.value === sort
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {opt.label}
              {opt.value === sort && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Published', value: 'published' },
  { label: 'Unpublished', value: 'unpublished' },
  { label: 'Imported', value: 'imported' },
]

function FilterDropdown({
  filterTypes,
  onToggle,
  statusFilter,
  onToggleStatus,
  className,
}: {
  filterTypes: QuestionType[]
  onToggle: (t: QuestionType) => void
  statusFilter: StatusFilter | undefined
  onToggleStatus: (s: StatusFilter) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  const isActive = filterTypes.length > 0 || statusFilter !== undefined

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        variant="outline"
        size="md"
        onClick={() => setOpen((o) => !o)}
        className="relative w-full gap-1.5 cursor-pointer"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
        {isActive && <span className="bg-primary absolute -top-1 -right-1 h-2 w-2 rounded-full" />}
      </Button>

      {open && (
        <div className="bg-popover text-popover-foreground border-border absolute right-0 z-50 mt-1 min-w-44 rounded-md border shadow-lg">
          <div className="border-border text-muted-foreground border-b px-3 py-2 text-xs font-medium">
            Quiz Type
          </div>
          {FILTERABLE_TYPES.map((t) => {
            const checked = filterTypes.includes(t.value as QuestionType)
            return (
              <button
                key={t.value}
                onClick={() => onToggle(t.value as QuestionType)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                  checked
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                    checked ? 'bg-primary border-primary' : 'border-border'
                  )}
                >
                  {checked && <Check className="text-primary-foreground h-3 w-3" />}
                </div>
                {t.label}
              </button>
            )
          })}

          <div className="border-border text-muted-foreground border-t border-b px-3 py-2 text-xs font-medium">
            Status
          </div>
          {STATUS_OPTIONS.map((opt) => {
            const checked = statusFilter === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onToggleStatus(opt.value)}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                  checked
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                    checked ? 'bg-primary border-primary' : 'border-border'
                  )}
                >
                  {checked && <div className="bg-primary-foreground h-1.5 w-1.5 rounded-full" />}
                </div>
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
