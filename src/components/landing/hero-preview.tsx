import { useEffect, useState } from 'react'
import { Check, Clock, FileText, Flame, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Hero dashboard preview — a self-playing, 3-scene story that walks a visitor
 * through the product in order: a document being processed, the quiz that gets
 * generated from it, and the mastery you track afterwards. The floating status
 * card stays in sync with the active scene so the two read as one narrative.
 *
 * All real markup (theme-aware, no images). Honors prefers-reduced-motion by
 * holding on the quiz scene with no cycling.
 */

const SCENE_COUNT = 3
const DWELL_MS = 3600

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function HeroPreview() {
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setStep((s) => (s + 1) % SCENE_COUNT), DWELL_MS)
    return () => clearInterval(id)
  }, [reduced])

  // Reduced motion: hold on the quiz scene (the most representative one).
  const active = reduced ? 1 : step

  return (
    <>
      <div className="to-background border-border from-muted/50 relative aspect-5/4 overflow-hidden rounded-2xl border bg-linear-to-br p-5 sm:p-6">
        {/* Scene swaps remount via key so inner stagger replays each cycle. */}
        <div key={active} className="scene-in absolute inset-0 p-5 sm:p-6">
          {active === 0 && <ProcessScene />}
          {active === 1 && <QuizScene />}
          {active === 2 && <AnalyticsScene />}
        </div>

        {/* Scene dots */}
        <div className="absolute right-4 bottom-3 flex items-center gap-1.5">
          {Array.from({ length: SCENE_COUNT }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500',
                i === active ? 'bg-primary w-4' : 'bg-muted-foreground/30 w-1.5'
              )}
            />
          ))}
        </div>
      </div>

      <FloatingStatus step={active} />
    </>
  )
}

/* ----------------------------------------------------------------------- */
/* Scene 1 — document being processed                                       */
/* ----------------------------------------------------------------------- */

function ProcessScene() {
  return (
    <div className="flex h-full flex-col">
      <div className="text-muted-foreground scene-item flex items-center gap-2 text-xs font-medium">
        <FileText size={14} className="text-primary" />
        Extracting key concepts…
      </div>

      <div className="border-border bg-card/60 scene-item relative mt-4 flex-1 overflow-hidden rounded-xl border p-4">
        {/* Scan sweep */}
        <div className="via-primary/15 pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-transparent to-transparent [animation-delay:300ms] scan-sweep" />
        <div className="relative space-y-3">
          {[92, 78, 85, 64, 88, 71, 80].map((w, i) => (
            <div
              key={i}
              className="bg-muted-foreground/20 h-2.5 rounded-full"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>

      <div className="scene-item mt-4 flex items-center gap-2" style={{ animationDelay: '120ms' }}>
        {['Mitochondria', 'ATP', 'Cellular respiration'].map((t) => (
          <span
            key={t}
            className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-[11px] font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Scene 2 — generated quiz question                                        */
/* ----------------------------------------------------------------------- */

const OPTIONS = [
  { label: 'Nucleus', correct: false },
  { label: 'Mitochondria', correct: true },
  { label: 'Ribosome', correct: false },
  { label: 'Golgi apparatus', correct: false },
]

function QuizScene() {
  return (
    <div className="flex h-full flex-col">
      <div className="scene-item flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
          Question 3 / 10
        </span>
        <span className="border-border text-muted-foreground flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium">
          <Clock size={12} className="text-primary" />
          0:24
        </span>
      </div>

      <div className="bg-muted scene-item mt-2 h-1.5 overflow-hidden rounded-full">
        <div className="bg-primary h-full w-[30%] rounded-full" />
      </div>

      <p
        className="scene-item mt-4 text-sm font-semibold sm:text-[15px]"
        style={{ animationDelay: '80ms' }}
      >
        Which organelle is the site of cellular respiration?
      </p>

      <div className="mt-3 space-y-2">
        {OPTIONS.map((opt, i) => (
          <div
            key={opt.label}
            className={cn(
              'scene-item flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors',
              opt.correct
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'border-border bg-card/40 text-foreground/80'
            )}
            style={{ animationDelay: `${160 + i * 90}ms` }}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                opt.correct
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-border text-muted-foreground'
              )}
            >
              {opt.correct ? <Check size={12} strokeWidth={3} /> : String.fromCharCode(65 + i)}
            </span>
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Scene 3 — mastery / analytics                                            */
/* ----------------------------------------------------------------------- */

function AnalyticsScene() {
  const r = 34
  const c = 2 * Math.PI * r
  const pct = 87

  return (
    <div className="flex h-full flex-col">
      <div className="text-muted-foreground scene-item flex items-center gap-2 text-xs font-medium">
        <TrendingUp size={14} className="text-primary" />
        Your progress
      </div>

      <div className="mt-4 flex items-center gap-5">
        {/* Score ring */}
        <div className="scene-item relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              strokeWidth="7"
              className="stroke-muted"
            />
            <circle
              cx="40"
              cy="40"
              r={r}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              className="stroke-primary"
              strokeDasharray={c}
              strokeDashoffset={c - (pct / 100) * c}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{pct}%</span>
            <span className="text-muted-foreground text-[10px]">avg score</span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="scene-item flex-1" style={{ animationDelay: '100ms' }}>
          <p className="text-muted-foreground text-[11px] font-medium">Score over time</p>
          <svg viewBox="0 0 120 44" className="mt-1 h-12 w-full overflow-visible">
            <defs>
              <linearGradient id="hp-spark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points="0,34 20,30 40,32 60,22 80,24 100,12 120,8 120,44 0,44"
              fill="url(#hp-spark)"
            />
            <polyline
              points="0,34 20,30 40,32 60,22 80,24 100,12 120,8"
              fill="none"
              className="stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="120" cy="8" r="3" className="fill-primary" />
          </svg>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatChip icon={<Sparkles size={13} />} value="12" label="quizzes taken" delay={180} />
        <StatChip
          icon={<Flame size={13} className="text-orange-500" />}
          value="5-day"
          label="study streak"
          delay={260}
        />
      </div>
    </div>
  )
}

function StatChip({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode
  value: string
  label: string
  delay: number
}) {
  return (
    <div
      className="border-border bg-card/50 scene-item rounded-xl border p-3"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-primary flex items-center gap-1.5 text-sm font-bold">
        {icon}
        {value}
      </div>
      <p className="text-muted-foreground mt-0.5 text-[11px]">{label}</p>
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* Floating status card — synced to the active scene                        */
/* ----------------------------------------------------------------------- */

const STATUS = [
  {
    tag: 'Processing',
    title: 'Biology_Lecture_04.pdf',
    progress: 66,
    icon: <Loader2 size={13} className="text-primary animate-spin" />,
    done: false,
  },
  {
    tag: 'Quiz ready',
    title: '10 questions generated',
    progress: 100,
    icon: <Sparkles size={13} className="text-primary" />,
    done: false,
  },
  {
    tag: 'Scored',
    title: '9 / 10 correct',
    progress: 100,
    icon: <Check size={13} className="text-emerald-500" strokeWidth={3} />,
    done: true,
  },
] as const

function FloatingStatus({ step }: { step: number }) {
  const s = STATUS[step]
  return (
    <div className="border-border bg-card absolute -bottom-4 left-5 max-w-57.5 rounded-xl border p-3 shadow-lg sm:left-8 sm:p-4">
      <div className="flex items-center gap-1.5">
        {s.icon}
        <p
          className={cn(
            'text-[10px] font-semibold tracking-[0.15em] uppercase',
            s.done ? 'text-emerald-500' : 'text-primary'
          )}
        >
          {s.tag}
        </p>
      </div>
      <p key={s.title} className="scene-item mt-1 text-sm font-semibold">
        {s.title}
      </p>
      <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            s.done ? 'bg-emerald-500' : 'bg-primary'
          )}
          style={{ width: `${s.progress}%` }}
        />
      </div>
    </div>
  )
}
