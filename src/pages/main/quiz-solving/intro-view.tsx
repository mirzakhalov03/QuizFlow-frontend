import { useNavigate } from 'react-router-dom'
import { useGet } from '@/hooks/useGet'
import { QUIZ_RESULT } from '@/constants/api-endpoints'
import { PATHS } from '@/lib/path'
import type { ApiResponse } from '@/types/api'
import type { QuizResultResponse } from '@/types/quiz'
import QuizIntro from '@/components/main/quiz-solving/quiz-intro'
import { useQuizSolving } from './context'

export default function QuizIntroView() {
  const { quiz } = useQuizSolving()
  const navigate = useNavigate()

  // Only first-timers skip this — once a quiz has been completed we surface the
  // last score. `enabled` keeps it from firing on a fresh, never-taken quiz.
  const hasAttempt = Boolean(quiz.completedAt)
  const { data } = useGet<ApiResponse<QuizResultResponse>>(QUIZ_RESULT(quiz.id), {
    enabled: hasAttempt,
  })

  const result = data?.data?.result
  const pastScore =
    result && result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : null

  const start = () => {
    const first = quiz.questions[0]
    if (first) navigate(PATHS.app.quizQuestion(quiz.id, first.id))
  }

  return <QuizIntro quiz={quiz} onStart={start} hasAttempt={hasAttempt} pastScore={pastScore} />
}
