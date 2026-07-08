import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import type { Question, QuizResult } from '@/types/quiz'
import QuizResultSummary from './quiz-result-summary'
import QuizResultQuestion from './quiz-result-question'

type Props = {
  quizTitle: string
  result: QuizResult | null
  questions: Question[]
  answers: Record<string, string | string[]>
  /** Map of questionId → graded verdict (open-ended). */
  verdicts: Record<string, boolean>
  /** Whether open-ended grading is still in flight. */
  isGrading: boolean
  onRetake: () => void
}

export default function QuizSubmitted({
  quizTitle,
  result,
  questions,
  answers,
  verdicts,
  isGrading,
  onRetake,
}: Props) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      {/* Top Actions */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/40">
        <Link to={PATHS.app.quizzes}>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Back to quizzes
          </Button>
        </Link>
        <Button onClick={onRetake} size="sm" className="gap-1.5 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          Retake quiz
        </Button>
      </div>

      {result ? (
        <QuizResultSummary quizTitle={quizTitle} result={result} />
      ) : (
        <section className="enter-fade-up border-border bg-card flex flex-col items-center gap-3 rounded-2xl border p-8 text-center">
          <CheckCircle className="text-primary h-10 w-10" />
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-bold">Quiz complete</h1>
            <p className="text-muted-foreground text-sm">{quizTitle}</p>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm">
            Your answers weren’t scored, but you can review the correct answers below.
          </p>
        </section>
      )}

      {questions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground px-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Review
          </h2>
          {questions.map((question, i) => (
            <QuizResultQuestion
              key={question.id}
              question={question}
              index={i}
              userAnswer={answers[question.id]}
              verdict={verdicts[question.id]}
              isGrading={isGrading}
              style={{ animationDelay: `${Math.min(i * 60 + 200, 700)}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
