import { Edit3, Key, Trash2, CheckCircle2 } from 'lucide-react'
import { ByokKey } from '@/types/byok'
import { cn } from '@/lib/utils'

type ByokKeyCardProps = {
  apiKey: ByokKey
  icon: string | null
  isActive: boolean
  onActivate: (id: string) => void
  onEdit: (key: ByokKey) => void
  onDelete: (id: string) => void
  isDeleting: boolean
  isActivating: boolean
}

export function ByokKeyCard({
  apiKey,
  icon,
  isActive,
  onActivate,
  onEdit,
  onDelete,
  isDeleting,
  isActivating,
}: ByokKeyCardProps) {
  return (
    <article
      className={cn(
        'border-border bg-card hover:border-primary/40 flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all relative',
        isActive && 'border-primary ring-1 ring-primary/20'
      )}
    >
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
            <h3 className="text-foreground truncate text-sm font-semibold" title={apiKey.keyName}>
              {apiKey.keyName}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                {apiKey.provider}
              </p>
              {isActive && (
                <span className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                  <CheckCircle2 size={10} />
                  ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => !isActive && onActivate(apiKey.id)}
            disabled={isActivating || isActive}
            className={cn(
              'text-muted-foreground hover:text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-50',
              isActive && 'text-primary'
            )}
            title={isActive ? 'Active Key' : 'Set as Active'}
          >
            <div
              className={cn(
                'h-4 w-4 rounded-full border-2 border-current flex items-center justify-center',
                isActive && 'bg-primary border-primary'
              )}
            >
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
          </button>
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
          <code className="text-muted-foreground font-mono text-[11px] tracking-tight break-all">
            {apiKey.maskedKey}
          </code>
        </div>
      </div>
    </article>
  )
}
