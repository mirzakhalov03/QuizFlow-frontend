import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  /** Phrases cycled through while loading (e.g. "Evaluating", "Calculating"). */
  messages: string[]
  /** How long each phrase stays before the next, in ms. */
  interval?: number
  className?: string
}

/**
 * Full-screen dimmed overlay with a small animation and cycling status words —
 * the "thinking" indicator shown while we wait on a slow operation (e.g. the
 * synchronous LLM grading call on quiz submit). Animations degrade gracefully
 * under prefers-reduced-motion (see `.thinking-shimmer` in index.css).
 */
export default function LoadingOverlay({ messages, interval = 2200, className }: Props) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length)
    }, interval)
    return () => clearInterval(id)
  }, [messages.length, interval])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'bg-background/80 fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-300ms]" />
        <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-150ms]" />
        <span className="bg-primary h-2 w-2 animate-bounce rounded-full" />
      </div>
      {/* key remounts on change so the fade-up replays per word; shimmer runs on
          the inner text so the two animations don't fight over `animation`. */}
      <div key={index} className="enter-fade-up">
        <p className="thinking-shimmer text-lg font-semibold">{messages[index]}</p>
      </div>
    </div>
  )
}
