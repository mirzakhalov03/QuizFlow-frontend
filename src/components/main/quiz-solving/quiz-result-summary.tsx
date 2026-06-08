import { useEffect, useState } from 'react'
import type { QuizResult } from '@/types/quiz'
import { getScoreBand } from '@/lib/quiz-result'

type Props = {
  quizTitle: string
  result: QuizResult
}

const RING_RADIUS = 54
const RING_CIRC = 2 * Math.PI * RING_RADIUS

const TONE = {
  high: {
    ring: 'stroke-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    label: 'Excellent work',
  },
  mid: {
    ring: 'stroke-primary',
    text: 'text-primary',
    label: 'Solid effort',
  },
  low: {
    ring: 'stroke-destructive',
    text: 'text-destructive',
    label: 'Keep practicing',
  },
} as const

export default function QuizResultSummary({ quizTitle, result }: Props) {
  const percentage =
    result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0
  const tone = TONE[getScoreBand(percentage)]

  // Animate the ring from empty to its final value on mount.
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(percentage))
    return () => cancelAnimationFrame(frame)
  }, [percentage])

  const dashOffset = RING_CIRC - (RING_CIRC * progress) / 100

  return (
    <section className="enter-fade-up border-border bg-card relative overflow-hidden rounded-2xl border p-8">
      <div className="bg-primary/10 pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full blur-3xl" />

      <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:gap-9">
        <div className="relative h-36 w-36 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={RING_RADIUS}
              className="stroke-muted"
              strokeWidth="9"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r={RING_RADIUS}
              className={`${tone.ring} transition-[stroke-dashoffset] duration-1000 ease-out`}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-heading text-4xl font-bold tabular-nums ${tone.text}`}>
              {percentage}
              <span className="text-2xl">%</span>
            </span>
            <span className="text-muted-foreground text-[0.7rem] tracking-wide uppercase">
              score
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-4 sm:items-start">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
              Quiz complete
            </p>
            <h1 className="font-heading text-2xl font-bold">{tone.label}</h1>
            <p className="text-muted-foreground text-sm">{quizTitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Stat
              value={result.correctAnswers}
              label="Correct"
              className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            />
            <Stat
              value={result.wrongAnswers}
              label="Incorrect"
              className="border-destructive/20 bg-destructive/10 text-destructive"
            />
            <Stat
              value={result.totalQuestions}
              label="Graded"
              className="border-border bg-muted text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${className}`}>
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
