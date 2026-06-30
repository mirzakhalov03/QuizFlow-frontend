import type { CSSProperties } from 'react'
import { Check, X } from 'lucide-react'
import type { Question, QuestionOption } from '@/types/quiz'
import { getReviewStatus, type ReviewStatus } from '@/lib/quiz-result'
import MarkdownText from './markdown-text'

type Props = {
  question: Question
  index: number
  userAnswer: string | string[] | undefined
  /** Verdict for an open-ended question once graded. */
  verdict?: boolean
  /** Whether open-ended grading is still in flight. */
  isGrading?: boolean
  style?: CSSProperties
}

const STATUS: Record<ReviewStatus, { label: string; cls: string }> = {
  correct: {
    label: 'Correct',
    cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  incorrect: {
    label: 'Incorrect',
    cls: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  unanswered: {
    label: 'Skipped',
    cls: 'border-border bg-muted text-muted-foreground',
  },
  ungraded: {
    label: 'Review',
    cls: 'border-primary/30 bg-primary/10 text-primary',
  },
  grading: {
    label: 'Scoring…',
    cls: 'border-primary/30 bg-primary/10 text-primary animate-pulse',
  },
}

export default function QuizResultQuestion({
  question,
  index,
  userAnswer,
  verdict,
  isGrading,
  style,
}: Props) {
  const status = getReviewStatus(question, userAnswer, { verdict, isGrading })
  const pill = STATUS[status]

  return (
    <article
      style={style}
      className="enter-fade-up border-border bg-card flex flex-col gap-4 rounded-xl border p-5"
    >
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {index + 1}
        </span>
        <MarkdownText
          text={question.text}
          className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed font-semibold"
        />
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${pill.cls}`}
        >
          {pill.label}
        </span>
      </div>

      <div className="flex flex-col gap-2 pl-9">
        {question.type === 'open_ended' ? (
          <OpenEndedReview
            question={question}
            answer={typeof userAnswer === 'string' ? userAnswer : ''}
          />
        ) : (
          question.options.map((option) => (
            <OptionRow key={option.id} option={option} userAnswer={userAnswer} />
          ))
        )}
      </div>
    </article>
  )
}

type OptionState = 'correct' | 'wrong' | 'neutral'

function OptionRow({
  option,
  userAnswer,
}: {
  option: QuestionOption
  userAnswer: string | string[] | undefined
}) {
  const isChosen = Array.isArray(userAnswer)
    ? userAnswer.includes(option.id)
    : option.id === userAnswer

  const state: OptionState = option.isCorrect ? 'correct' : isChosen ? 'wrong' : 'neutral'

  const box =
    state === 'correct'
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : state === 'wrong'
        ? 'border-destructive/40 bg-destructive/10'
        : 'border-border'

  const label =
    isChosen && option.isCorrect
      ? { text: 'Your answer', cls: 'text-emerald-600 dark:text-emerald-400' }
      : option.isCorrect
        ? { text: 'Correct answer', cls: 'text-emerald-600 dark:text-emerald-400' }
        : isChosen
          ? { text: 'Your answer', cls: 'text-destructive' }
          : null

  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${box}`}>
      <Marker state={state} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <MarkdownText text={option.text} className="text-sm" />
          {label && (
            <span className={`shrink-0 text-xs font-medium ${label.cls}`}>{label.text}</span>
          )}
        </div>
        {option.explanation && (
          <MarkdownText
            text={option.explanation}
            className="text-muted-foreground mt-1.5 text-xs leading-relaxed"
          />
        )}
      </div>
    </div>
  )
}

function Marker({ state }: { state: OptionState }) {
  if (state === 'correct') {
    return <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
  }
  if (state === 'wrong') {
    return <X className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
  }
  return <span className="border-muted-foreground/30 mt-0.5 h-4 w-4 shrink-0 rounded-full border" />
}

function OpenEndedReview({ question, answer }: { question: Question; answer: string }) {
  const reference = question.options.find((o) => o.explanation || o.text)
  const referenceText = reference?.explanation ?? reference?.text
  const trimmed = answer.trim()

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border rounded-lg border p-3">
        <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
          Your answer
        </p>
        {trimmed ? (
          <MarkdownText text={trimmed} className="text-sm leading-relaxed" />
        ) : (
          <p className="text-muted-foreground text-sm italic">You didn’t answer this question.</p>
        )}
      </div>

      {referenceText && (
        <div className="border-primary/30 bg-primary/5 rounded-lg border p-3">
          <p className="text-primary mb-1 text-xs font-medium tracking-wide uppercase">
            Suggested answer
          </p>
          <MarkdownText text={referenceText} className="text-sm leading-relaxed" />
        </div>
      )}
    </div>
  )
}
