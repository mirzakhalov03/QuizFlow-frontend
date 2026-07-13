import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
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
 * Lightweight click-outside dropdown. The panel is portaled to document.body
 * and positioned via fixed coordinates — this keeps it above sibling cards
 * regardless of stacking contexts created inside the grid (e.g. cards with
 * hover transforms), which a plain `absolute` + `z-50` can't escape.
 */
export function DropdownMenu({
  trigger,
  children,
  align = 'end',
  triggerClassName,
  ariaLabel,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    const triggerEl = triggerRef.current
    if (!triggerEl) return
    const rect = triggerEl.getBoundingClientRect()
    const panelWidth = panelRef.current?.offsetWidth ?? 176 // matches min-w-44 fallback

    setCoords({
      top: rect.bottom + 4,
      left: align === 'end' ? rect.right - panelWidth : rect.left,
    })
  }

  useLayoutEffect(() => {
    if (open) updatePosition()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    // Reposition on scroll/resize so the panel tracks the trigger, since it's
    // no longer a normal-flow child of it.
    const onReposition = () => updatePosition()

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onReposition, true)
    window.addEventListener('resize', onReposition)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onReposition, true)
      window.removeEventListener('resize', onReposition)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
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

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            style={{ position: 'fixed', top: coords.top, left: coords.left }}
            className="bg-popover text-popover-foreground border-border z-50 min-w-44 overflow-hidden rounded-lg border p-1 shadow-lg"
          >
            {children}
          </div>,
          document.body
        )}
    </>
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