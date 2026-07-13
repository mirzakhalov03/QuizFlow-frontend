import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  Check,
  Clock,
  Flame,
  Hash,
  Pencil,
  RotateCcw,
  Share2,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { usePatch } from '@/hooks/usePatch'
import { QUIZ_BY_ID, QUIZ_LIST } from '@/constants/api-endpoints'
import { toast } from '@/lib/toast'
import { TYPE_LABELS } from '@/components/main/quizzes/utils'
import { PublishModal } from '@/components/main/marketplace/publish-modal'
import { useAuthStore } from '@/store/use-authstore'
import type { QuestionType, QuizWithQuestions } from '@/types/quiz'
import { pickIntroQuote } from './intro-quotes'
import MarkdownText from './markdown-text'
import StartCountdownOverlay from './start-countdown-overlay'

type Props = {
  quiz: QuizWithQuestions
  onStart: () => void
  hasAttempt?: boolean
  pastScore?: number | null
}

const MAX_TITLE_LENGTH = 200

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-emerald-600 text-white dark:bg-emerald-500',
  medium: 'bg-amber-600 text-white dark:bg-amber-500',
  hard: 'bg-rose-600 text-white dark:bg-rose-500',
}

const DIFFICULTY_ICON: Record<string, React.ElementType> = {
  easy: Sparkles,
  medium: Flame,
  hard: Zap,
}

const DIFFICULTY_ICON_ANIMATION: Record<string, string> = {
  easy: 'icon-twinkle',
  medium: 'icon-flame',
  hard: 'icon-electric',
}

/** "3 Multiple Choice · 2 Open Ended" — derived from the actual questions, so a
 *  `mixed` quiz reads as its real composition rather than a vague "Mixed". */
function buildTypeBreakdown(quiz: QuizWithQuestions): string {
  const counts = new Map<QuestionType, number>()
  for (const q of quiz.questions) {
    counts.set(q.type, (counts.get(q.type) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([type, n]) => `${n} ${TYPE_LABELS[type]} ${n === 1 ? 'Question' : 'Questions'}`)
    .join(' · ')
}

/** Score-tiered styling + copy so the "last attempt" banner reflects how the
 *  attempt actually went, instead of always reading as a green success state
 *  even when the score was low. */
function getScoreBannerStyle(score: number) {
  if (score < 40) {
    return {
      wrapperClass:
        'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400',
      icon: RotateCcw,
      suffix: 'give it another shot!',
    }
  }
  if (score < 70) {
    return {
      wrapperClass:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400',
      icon: Check,
      suffix: "you're getting there!",
    }
  }
  return {
    wrapperClass:
      'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300',
    icon: Check,
    suffix: 'good job!',
  }
}

export default function QuizIntro({ quiz, onStart, hasAttempt, pastScore }: Props) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const isOwner = currentUserId === quiz.userId
  const durationMinutes = quiz.timerDuration ? Math.round(quiz.timerDuration / 60) : null

  const queryClient = useQueryClient()
  const { mutate: rename, isPending } = usePatch<{ title: string }>()

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(quiz.title)
  const [publishOpen, setPublishOpen] = useState(false)

  const quote = useMemo(() => pickIntroQuote(), [])
  const typeBreakdown = useMemo(() => buildTypeBreakdown(quiz), [quiz])
  const difficulty = quiz.difficulty?.toLowerCase() ?? null
  const DifficultyIcon = difficulty ? DIFFICULTY_ICON[difficulty] : null

  const scoreBanner =
    pastScore !== null && pastScore !== undefined ? getScoreBannerStyle(pastScore) : null

  // Countdown renders as a full-screen overlay (see StartCountdownOverlay),
  // not inside the button. `null` means idle; ticks 3 → 2 → 1 then onStart.
  const [countdown, setCountdown] = useState<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

 const beginCountdown = () => {
  if (countdown !== null) return
  setCountdown(3)
  intervalRef.current = setInterval(() => {
    setCountdown((prev) => {
      if (prev === null) return null
      if (prev <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        onStart()
        // Don't reset to null here — that would unmount the overlay a frame
        // before the route actually swaps to the question view, briefly
        // revealing the intro card underneath. Keep the overlay showing "1"
        // until this component unmounts naturally from the navigation.
        return prev
      }
      return prev - 1
    })
  }, 1000)
}

  const startEditing = () => {
    setDraft(quiz.title)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setDraft(quiz.title)
  }

  const saveTitle = () => {
    const next = draft.trim()
    if (!next) {
      toast.error('Title cannot be empty.')
      return
    }
    if (next === quiz.title) {
      setIsEditing(false)
      return
    }
    rename(
      QUIZ_BY_ID(quiz.id),
      { title: next },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QUIZ_BY_ID(quiz.id)] })
          queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
          setIsEditing(false)
          toast.success('Quiz renamed.')
        },
      }
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveTitle()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  const isCountingDown = countdown !== null

  return (
    <>
      <div className="enter-fade-up border-border bg-card relative mx-auto max-w-2xl overflow-hidden rounded-3xl border shadow-xl shadow-black/5 dark:shadow-black/30">
        <div className="relative flex flex-col gap-7 p-7 sm:p-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={MAX_TITLE_LENGTH}
                      disabled={isPending}
                      aria-label="Quiz title"
                      className="border-border focus-visible:ring-primary/40 min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-1.5 text-2xl font-bold outline-none focus-visible:ring-2 disabled:opacity-60"
                    />
                    <div className="flex shrink-0 gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={saveTitle}
                        loading={isPending}
                        aria-label="Save title"
                      >
                        {!isPending && <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={isPending}
                        aria-label="Cancel rename"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    <h1 className="text-2xl leading-tight font-bold">{quiz.title}</h1>
                    <button
                      type="button"
                      onClick={startEditing}
                      aria-label="Rename quiz"
                      className="text-muted-foreground hover:text-foreground shrink-0 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {difficulty && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        DIFFICULTY_STYLES[difficulty] ?? 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {DifficultyIcon && (
                        <DifficultyIcon
                          className={`h-3 w-3 ${DIFFICULTY_ICON_ANIMATION[difficulty] ?? ''}`}
                        />
                      )}
                      {difficulty}
                    </span>
                  )}
                  {quiz.isTimerEnabled && durationMinutes && (
                    <span className="bg-muted text-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      {durationMinutes} min
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                  <Hash className="h-3.5 w-3.5" />
                  {typeBreakdown || `${quiz.questions.length} questions`}
                </p>
              </div>
            </div>

            {quiz.userInstructions && (
              <MarkdownText
                text={quiz.userInstructions}
                className="text-muted-foreground text-sm leading-relaxed"
              />
            )}
          </div>

          {hasAttempt && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
                scoreBanner
                  ? scoreBanner.wrapperClass
                  : 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300'
              }`}
            >
              {scoreBanner ? (
                <scoreBanner.icon className="h-4 w-4 shrink-0" />
              ) : (
                <Check className="h-4 w-4 shrink-0" />
              )}
              {pastScore !== null && pastScore !== undefined ? (
                <span>
                  You scored <span className="font-semibold">{pastScore}%</span> last time —{' '}
                  {scoreBanner?.suffix}
                </span>
              ) : (
                <span>You’ve completed this quiz before</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-block rounded-lg ${isCountingDown ? '' : 'ripple-wrapper'}`}>
                <Button
                  onClick={beginCountdown}
                  disabled={isCountingDown || quiz.questions.length === 0}
                  className="start-quiz-button shadow-primary/20 relative min-w-36 gap-2 overflow-hidden text-base font-semibold shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Zap className="h-4 w-4" />
                  Start Quiz
                </Button>
              </span>

              {isOwner && quiz.properties?.generatedBy !== 'clone' && (
                <button
                  type="button"
                  onClick={() => setPublishOpen(true)}
                  className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition"
                >
                  <Share2 className="h-4 w-4" />
                  Publish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCountingDown && <StartCountdownOverlay count={countdown} quote={quote} />}

      {isOwner && quiz.properties?.generatedBy !== 'clone' && (
        <PublishModal quizId={quiz.id} open={publishOpen} onClose={() => setPublishOpen(false)} />
      )}
    </>
  )
}
