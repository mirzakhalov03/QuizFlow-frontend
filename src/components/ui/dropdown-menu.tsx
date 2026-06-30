import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type DropdownMenuProps = {
  /** Rendered inside the trigger button (e.g. an icon). */
  trigger: ReactNode
  children: ReactNode
  /** Which edge the panel aligns to. Defaults to the right. */
  align?: 'start' | 'end'
  triggerClassName?: string
  ariaLabel?: string
}

/**
 * Lightweight click-outside dropdown. Stops click propagation on the whole
 * subtree so it can live inside a clickable card without triggering the card's
 * own navigation. Closes on outside pointerdown or Escape.
 */
export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  triggerClassName,
  ariaLabel,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={cn(
          'text-muted-foreground hover:text-foreground focus-visible:ring-primary/30 rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none',
          triggerClassName
        )}
      >
        {trigger}
      </button>

      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            'bg-popover text-popover-foreground border-border absolute z-50 mt-1 min-w-44 overflow-hidden rounded-lg border p-1 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

type DropdownItemProps = {
  icon?: LucideIcon
  children: ReactNode
  onClick?: (e: React.MouseEvent) => void
  destructive?: boolean
  disabled?: boolean
}

export function DropdownItem({
  icon: Icon,
  children,
  onClick,
  destructive,
  disabled,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40',
        destructive ? 'text-destructive hover:bg-destructive/10' : 'hover:bg-muted'
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  )
}
