import { useState } from 'react'
import { ArrowUpDown, Check, SlidersHorizontal } from 'lucide-react'

import Button from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SortOption } from '@/hooks/useQuizListControls'
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
}

export function QuizToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filterTypes,
  onToggleFilter,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-40 flex-1">
        <Input
          type="search"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
        />
      </div>
      <SortDropdown sort={sort} onChange={onSortChange} />
      <FilterDropdown filterTypes={filterTypes} onToggle={onToggleFilter} />
    </div>
  )
}

function SortDropdown({ sort, onChange }: { sort: SortOption; onChange: (s: SortOption) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort'

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1.5">
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

function FilterDropdown({
  filterTypes,
  onToggle,
}: {
  filterTypes: QuestionType[]
  onToggle: (t: QuestionType) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  const isActive = filterTypes.length > 0

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="relative gap-1.5"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
        {isActive && <span className="bg-primary absolute -top-1 -right-1 h-2 w-2 rounded-full" />}
      </Button>

      {open && (
        <div className="bg-popover text-popover-foreground border-border absolute left-0 z-50 mt-1 min-w-44 rounded-md border shadow-lg sm:right-0 sm:left-auto">
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
        </div>
      )}
    </div>
  )
}
