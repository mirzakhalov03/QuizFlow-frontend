import { CustomSelect } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { HistoryLimit, HistorySort } from '@/types/analytics'
import type { Folder } from '@/types/folder'

type Props = {
  folders: Folder[]
  folderId: string | null
  onFolderChange: (id: string | null) => void
  limit: HistoryLimit
  onLimitChange: (n: HistoryLimit) => void
  sort: HistorySort
  onSortChange: (s: HistorySort) => void
}

const ALL = '__all__'
const LIMITS: HistoryLimit[] = [5, 10, 50]
const SORTS: { value: HistorySort; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'best', label: 'Best' },
  { value: 'worst', label: 'Worst' },
]

export default function HistoryFilters({
  folders,
  folderId,
  onFolderChange,
  limit,
  onLimitChange,
  sort,
  onSortChange,
}: Props) {
  const folderOptions = [
    { label: 'All quizzes', value: ALL },
    ...folders.map((f) => ({ label: f.name, value: f.id })),
  ]

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Folder:</span>
        <CustomSelect
          options={folderOptions}
          value={folderId ?? ALL}
          onChange={(v) => onFolderChange(v === ALL ? null : v)}
          className="min-w-32 sm:min-w-40"
        />
      </div>

      <Segmented
        label="Show"
        value={String(limit)}
        options={LIMITS.map((n) => ({ value: String(n), label: String(n) }))}
        onChange={(v) => onLimitChange(Number(v) as HistoryLimit)}
      />

      <Segmented
        label="Sort"
        value={sort}
        options={SORTS}
        onChange={(v) => onSortChange(v as HistorySort)}
      />
    </div>
  )
}

type SegmentedProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function Segmented({ label, value, options, onChange }: SegmentedProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">{label}:</span>
      <div className="border-border inline-flex overflow-hidden rounded-md border" role="group">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-2.5 py-1.5 text-sm transition-colors sm:px-3',
              value === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
