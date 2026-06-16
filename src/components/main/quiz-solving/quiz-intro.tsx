import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, Check, Clock, Hash, Pencil, Sparkles, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { usePatch } from '@/hooks/usePatch'
import { QUIZ_BY_ID, QUIZ_LIST } from '@/constants/api-endpoints'
import { toast } from '@/lib/toast'
import { TYPE_LABELS } from '@/components/main/quizzes/utils'
import type { QuestionType, QuizWithQuestions } from '@/types/quiz'
import { pickIntroQuote } from './intro-quotes'
import MarkdownText from './markdown-text'

type Props = {
  quiz: QuizWithQuestions
  onStart: () => void
  hasAttempt?: boolean
  pastScore?: number | null
}

const MAX_TITLE_LENGTH = 200

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

/** "3 Multiple Choice · 2 Open Ended" — derived from the actual questions, so a
 *  `mixed` quiz reads as its real composition rather than a vague "Mixed". */
function buildTypeBreakdown(quiz: QuizWithQuestions): string {
  const counts = new Map<QuestionType, number>()
  for (const q of quiz.questions) {
    counts.set(q.type, (counts.get(q.type) ?? 0) + 1)
  }
  return [...counts.entries()].map(([type, n]) => `${n} ${TYPE_LABELS[type]}`).join(' · ')
}

export default function QuizIntro({ quiz, onStart, hasAttempt, pastScore }: Props) {
  const durationMinutes = quiz.timerDuration ? Math.round(quiz.timerDuration / 60) : null

  const queryClient = useQueryClient()
  const { mutate: rename, isPending } = usePatch<{ title: string }>()

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(quiz.title)

  // Stable per mount so it doesn't reshuffle on every keystroke while renaming.
  const quote = useMemo(() => pickIntroQuote(), [])
  const typeBreakdown = useMemo(() => buildTypeBreakdown(quiz), [quiz])
  const difficulty = quiz.difficulty?.toLowerCase() ?? null

  // Countdown shown inside the Start button: 3 → 2 → 1, then fire onStart.
  // `null` means idle. We tick once per second via setInterval and clear it on
  // unmount so a navigation mid-countdown doesn't leave a dangling timer.
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
          return null
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
    <div className="enter-fade-up border-border mx-auto max-w-2xl overflow-hidden rounded-xl border">
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={MAX_TITLE_LENGTH}
                disabled={isPending}
                aria-label="Quiz title"
                className="border-border focus-visible:ring-primary/40 w-full rounded-lg border bg-transparent px-3 py-1.5 text-2xl font-bold outline-none focus-visible:ring-2 disabled:opacity-60"
              />
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
          ) : (
            <div className="group flex items-center gap-2">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
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
          {quiz.userInstructions && (
            <MarkdownText
              text={quiz.userInstructions}
              className="text-muted-foreground text-sm leading-relaxed"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {difficulty && (
              <span
                className={`flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  DIFFICULTY_STYLES[difficulty] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {difficulty}
              </span>
            )}
            <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
              <Hash className="h-3 w-3" />
              {quiz.questions.length} questions
            </span>
            {quiz.isTimerEnabled && durationMinutes && (
              <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
                <Clock className="h-3 w-3" />
                {durationMinutes} min
              </span>
            )}
          </div>
          {typeBreakdown && <p className="text-muted-foreground text-xs">{typeBreakdown}</p>}
        </div>

        {hasAttempt && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
            <Check className="h-4 w-4 shrink-0" />
            {pastScore !== null && pastScore !== undefined ? (
              <span>
                You scored <span className="font-semibold">{pastScore}%</span> last time
              </span>
            ) : (
              <span>You’ve completed this quiz before</span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm italic">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {quote}
          </p>
          <Button
            onClick={beginCountdown}
            disabled={isCountingDown}
            className="min-w-32 self-start"
            rightIcon={isCountingDown ? undefined : <ArrowRight className="h-4 w-4" />}
          >
            {isCountingDown ? countdown : "Let's go..."}
          </Button>
        </div>
      </div>
    </div>
  )
}
