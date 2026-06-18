import { Check, X } from 'lucide-react'
import type { PublicQuestion, PublicReviewItem } from '@/types/quiz'
import MarkdownText from '@/components/main/quiz-solving/markdown-text'

type Props = {
  question: PublicQuestion
  index: number
  review: PublicReviewItem | undefined
  userAnswer: string | string[] | undefined
}

export default function PublicResultQuestion({ question, index, review, userAnswer }: Props) {
  const isCorrect = review?.isCorrect ?? false
  const correctIds = new Set(review?.correctOptionIds ?? [])

  const pill = isCorrect
    ? {
        label: 'Correct',
        cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      }
    : { label: 'Incorrect', cls: 'border-destructive/30 bg-destructive/10 text-destructive' }

  return (
    <article className="border-border bg-card flex flex-col gap-4 rounded-xl border p-5">
      <div className="flex items-start gap-3">
        <span className="bg-muted text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
          {index + 1}
        </span>
        <MarkdownText
          text={question.text}
          className="flex-1 pt-0.5 text-sm leading-relaxed font-semibold"
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
            answer={typeof userAnswer === 'string' ? userAnswer : ''}
            modelAnswer={review?.modelAnswer}
          />
        ) : (
          question.options.map((option) => {
            const isChosen = Array.isArray(userAnswer)
              ? userAnswer.includes(option.id)
              : option.id === userAnswer
            const isOptionCorrect = correctIds.has(option.id)
            const state = isOptionCorrect ? 'correct' : isChosen ? 'wrong' : 'neutral'
            const box =
              state === 'correct'
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : state === 'wrong'
                  ? 'border-destructive/40 bg-destructive/10'
                  : 'border-border'
            const label =
              isChosen && isOptionCorrect
                ? { text: 'Your answer', cls: 'text-emerald-600 dark:text-emerald-400' }
                : isOptionCorrect
                  ? { text: 'Correct answer', cls: 'text-emerald-600 dark:text-emerald-400' }
                  : isChosen
                    ? { text: 'Your answer', cls: 'text-destructive' }
                    : null

            return (
              <div key={option.id} className={`flex gap-3 rounded-lg border p-3 ${box}`}>
                {state === 'correct' ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : state === 'wrong' ? (
                  <X className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <span className="border-muted-foreground/30 mt-0.5 h-4 w-4 shrink-0 rounded-full border" />
                )}
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <MarkdownText text={option.text} className="text-sm" />
                  {label && (
                    <span className={`shrink-0 text-xs font-medium ${label.cls}`}>
                      {label.text}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </article>
  )
}

function OpenEndedReview({ answer, modelAnswer }: { answer: string; modelAnswer?: string }) {
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
      {modelAnswer && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="mb-1 text-xs font-medium tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
            Correct answer
          </p>
          <MarkdownText text={modelAnswer} className="text-sm leading-relaxed" />
        </div>
      )}
    </div>
  )
}
