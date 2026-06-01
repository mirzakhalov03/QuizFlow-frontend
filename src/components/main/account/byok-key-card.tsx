import { Edit3, Key, Trash2 } from 'lucide-react'
import { ByokKey } from '@/types/byok'

type ByokKeyCardProps = {
  apiKey: ByokKey
  icon: string | null
  onEdit: (key: ByokKey) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}

export function ByokKeyCard({
  apiKey,
  icon,
  onEdit,
  onDelete,
  isDeleting,
}: ByokKeyCardProps) {
  return (
    <article className="border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-xl border p-4 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            {icon ? (
              <img src={icon} alt={apiKey.provider} className="h-5 w-5 object-contain" />
            ) : (
              <Key size={18} className="text-primary" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground" title={apiKey.keyName}>
              {apiKey.keyName}
            </h3>
            <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              {apiKey.provider}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onEdit(apiKey)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            title="Edit key"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(apiKey.id)}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-50"
            title="Delete key"
          >
            <Trash2 size={14} className={isDeleting ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-muted/40 border-border/50 rounded-lg border px-3 py-2">
          <code className="text-muted-foreground break-all font-mono text-[11px] tracking-tight">
            {apiKey.maskedKey}
          </code>
        </div>
      </div>
    </article>
  )
}
