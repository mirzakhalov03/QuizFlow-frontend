import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useGet } from '@/hooks/useGet'
import { QUIZ_RESULT } from '@/constants/api-endpoints'
import { PATHS } from '@/lib/path'
import type { ApiResponse } from '@/types/api'
import type { QuizResultResponse } from '@/types/quiz'
import { Button } from '@/components/ui/button'
import LoadingOverlay from '@/components/ui/loading-overlay'
import QuizSubmitted from '@/components/main/quiz-solving/quiz-submitted'
import { useQuizSolving } from './context'

const GRADING_MESSAGES = [
  'Submitting your answers',
  'Evaluating your responses',
  'Comparing against the model answer',
  'Calculating your score',
  'Almost there',
]

export default function QuizResultView() {
  const { quiz, retake, isSubmitting, submitFailed } = useQuizSolving()
  const navigate = useNavigate()

  // Latch: once a submit is in flight, keep the grading overlay up through the
  // follow-up result fetch so there's no spinner flash between them. Stays false
  // for plain revisits (no active submit), which get the normal spinner. Set
  // during render (not an effect) to converge in the same pass — see useQuizTimer.
  const [didSubmit, setDidSubmit] = useState(isSubmitting)
  if (isSubmitting && !didSubmit) setDidSubmit(true)

  // Don't fetch mid-submit: the result row isn't finalized yet and the overlay
  // is up regardless. Fetch once the submit settles (grading is synchronous, so
  // the row is final by then).
  const { data, isLoading, isError } = useGet<ApiResponse<QuizResultResponse>>(
    QUIZ_RESULT(quiz.id),
    { options: { staleTime: 0, enabled: !isSubmitting } }
  )

  const payload = data?.data
  const result = payload?.result ?? null

  const verdicts = useMemo<Record<string, boolean>>(() => {
    const list = payload?.verdicts
    if (!list) return {}
    return list.reduce<Record<string, boolean>>((acc, v) => {
      acc[v.questionId] = v.isCorrect
      return acc
    }, {})
  }, [payload])

  const answers = useMemo<Record<string, string | string[]>>(() => {
    const list = payload?.answers
    if (!list) return {}
    return list.reduce<Record<string, string | string[]>>((acc, a) => {
      acc[a.questionId] = a.selectedOptionIds ?? a.selectedOptionId ?? a.textAnswer ?? ''
      return acc
    }, {})
  }, [payload])

  // Grading (a synchronous LLM call) and the follow-up fetch are covered by one
  // continuous overlay, until the finalized result lands or something errors.
  if (didSubmit && !submitFailed && !isError && !result && (isSubmitting || isLoading)) {
    return <LoadingOverlay messages={GRADING_MESSAGES} />
  }

  // A failed submit (which eager-navigated us here) or a failed result fetch
  // both surface an error rather than silently bouncing the user to the intro.
  if (submitFailed || isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-destructive">
          {submitFailed ? 'We couldn’t submit your quiz.' : 'We couldn’t load your results.'} Please
          try again.
        </p>
        <Button variant="outline" onClick={() => navigate(PATHS.app.quiz(quiz.id))}>
          Back to quiz
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  if (!result) {
    return <Navigate to={PATHS.app.quiz(quiz.id)} replace />
  }

  return (
    <QuizSubmitted
      quizTitle={quiz.title}
      result={result}
      questions={quiz.questions}
      answers={answers}
      verdicts={verdicts}
      isGrading={false}
      onRetake={retake}
    />
  )
}
