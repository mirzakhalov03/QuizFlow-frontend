import { forwardRef } from 'react'
import type { PublicSubmitResponse } from '@/types/quiz'

type Props = {
  quizTitle: string
  result: PublicSubmitResponse
}

const ResultShareCard = forwardRef<HTMLDivElement, Props>(({ quizTitle, result }, ref) => {
  const pct =
    result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0

  return (
    <div
      ref={ref}
      className="from-primary/10 to-card border-border flex w-[380px] flex-col gap-4 rounded-2xl border bg-gradient-to-br p-8"
    >
      <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">QuizFlow result</p>
      <h2 className="font-heading text-xl font-bold">{quizTitle}</h2>
      <div className="flex items-end gap-2">
        <span className="font-heading text-primary text-5xl font-bold tabular-nums">{pct}%</span>
        <span className="text-muted-foreground mb-1 text-sm">
          {result.correctAnswers}/{result.totalQuestions} correct
        </span>
      </div>
      <p className="text-sm font-medium">{result.name}</p>
      <p className="text-muted-foreground text-xs">Make your own quiz at QuizFlow</p>
    </div>
  )
})
ResultShareCard.displayName = 'ResultShareCard'
export default ResultShareCard
