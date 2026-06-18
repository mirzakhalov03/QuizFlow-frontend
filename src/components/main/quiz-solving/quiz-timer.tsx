import { Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  timeRemaining: number
}

export default function QuizTimer({ timeRemaining }: Props) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const level = timeRemaining <= 30 ? 'danger' : timeRemaining <= 60 ? 'warning' : 'normal'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 font-mono text-sm font-semibold tabular-nums',
        level === 'danger' && 'border-destructive/40 bg-destructive/5 text-destructive',
        level === 'warning' && 'border-amber-500/40 text-amber-500',
        level === 'normal' && 'border-border text-foreground'
      )}
    >
      <Hourglass className="hourglass-flip h-3.5 w-3.5" aria-hidden />
      {display}
    </span>
  )
}
