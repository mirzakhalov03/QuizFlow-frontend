import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BellRing, CircleCheck, CircleX, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useToastStore, type ToastItem } from '../../store/toast-store'
import Spinner from './spinner'

const TOAST_WIDTH = 356
const GAP = 14
const VISIBLE_STACK = 3

const accentFor = (type: ToastItem['type']) => {
  switch (type) {
    case 'error':
      return 'bg-destructive/10 border-destructive/30 border-l-4 border-l-destructive ring-1 ring-destructive/30'
    case 'success':
    case 'info':
    case 'loading':
    default:
      return 'bg-primary/10 border-primary/30 border-l-4 border-l-primary ring-1 ring-primary/30'
  }
}

const iconFor = (type: ToastItem['type']) => {
  switch (type) {
    case 'success':
      return <CircleCheck size={20} className="text-primary" />
    case 'error':
      return <CircleX size={20} className="text-destructive" />
    case 'info':
      return <BellRing size={20} className="text-primary" />
    case 'loading':
      return <Spinner size="sm" />
    default:
      return null
  }
}

function ToastCard({
  toast,
  reverseIndex,
  expanded,
  onHeight,
}: {
  toast: ToastItem
  reverseIndex: number
  expanded: boolean
  onHeight: (id: string | number, h: number) => void
}) {
  const remove = useToastStore((s) => s.remove)
  const [mounted, setMounted] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const ref = useRef<HTMLLIElement | null>(null)
  const remainingRef = useRef<number>(toast.duration)
  const startRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = Date.now()
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!ref.current) return
    const h = ref.current.getBoundingClientRect().height
    onHeight(toast.id, h)
  }, [toast.id, toast.title, toast.description, onHeight])

  const dismiss = useCallback(() => {
    setLeaving(true)
    window.setTimeout(() => remove(toast.id), 200)
  }, [remove, toast.id])

  useEffect(() => {
    if (!isFinite(toast.duration)) return

    if (expanded) {
      remainingRef.current -= Date.now() - startRef.current
      return
    }

    startRef.current = Date.now()

    const timeout = window.setTimeout(() => {
      dismiss()
    }, remainingRef.current)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [expanded, toast.duration, dismiss])

  const hidden = reverseIndex >= VISIBLE_STACK && !expanded
  const offset = reverseIndex * (expanded ? 0 : 14)
  const scale = expanded ? 1 : 1 - reverseIndex * 0.05

  return (
    <li
      ref={ref}
      data-expanded={expanded}
      data-reverse-index={reverseIndex}
      className={cn(
        'text-foreground pointer-events-auto absolute top-0 right-0 flex items-start gap-2 rounded-md border p-3 pr-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out',
        accentFor(toast.type),
        !mounted && '-translate-y-2 opacity-0',
        leaving && '-translate-y-2 opacity-0'
      )}
      style={{
        width: TOAST_WIDTH,
        transform: `translateY(${offset}px) scale(${scale})`,
        opacity: leaving ? 0 : hidden ? 0 : 1,
        zIndex: 1000 - reverseIndex,
      }}
    >
      {iconFor(toast.type)}
      <div className="min-w-0 flex-1">
        {toast.title && <div className="text-sm font-medium">{toast.title}</div>}
        {toast.description && (
          <div className="text-muted-foreground mt-0.5 text-xs">{toast.description}</div>
        )}
      </div>
      {toast.dismissible && (
        <button
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground absolute top-2 right-2 transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      )}
    </li>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const heights = useRef<Map<string | number, number>>(new Map())
  const [, forceRender] = useState(0)

  useEffect(() => setMounted(true), [])

  const onHeight = (id: string | number, h: number) => {
    if (heights.current.get(id) === h) return
    heights.current.set(id, h)
    forceRender((n) => n + 1)
  }

  if (!mounted) return null

  const reversed = [...toasts].reverse()
  const expandedHeight = reversed.reduce(
    // eslint-disable-next-line react-hooks/refs
    (acc, t) => acc + (heights.current.get(t.id) ?? 64) + GAP,
    0
  )
  const collapsedHeight = 80

  return createPortal(
    <ol
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="pointer-events-none fixed top-4 right-4 z-9999 flex flex-col"
      style={{
        width: TOAST_WIDTH,
        height: toasts.length ? (expanded ? expandedHeight : collapsedHeight) : 0,
      }}
    >
      {reversed.map((t, i) => (
        <ToastCard key={t.id} toast={t} reverseIndex={i} expanded={expanded} onHeight={onHeight} />
      ))}
    </ol>,
    document.body
  )
}
