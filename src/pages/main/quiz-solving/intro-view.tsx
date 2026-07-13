import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PATHS } from '@/lib/path'
import QuizIntro from '@/components/main/quiz-solving/quiz-intro'
import { useQuizSolving } from './context'

export default function QuizIntroView() {
  const { quiz } = useQuizSolving()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const hasAttempt = Boolean(quiz.completedAt)
  const pastScore =
    quiz.lastAttempt && quiz.lastAttempt.totalQuestions > 0
      ? Math.round((quiz.lastAttempt.correctAnswers / quiz.lastAttempt.totalQuestions) * 100)
      : null

  const firstQuestionId = quiz.questions[0]?.id

  // When ?autostart=1 is present (e.g. navigated from the marketplace listing
  // after the countdown), skip the intro and jump straight to Q1.
  useEffect(() => {
    if (searchParams.get('autostart') === '1' && firstQuestionId) {
      navigate(PATHS.app.quizQuestion(quiz.id, firstQuestionId), { replace: true })
    }
  }, [searchParams, firstQuestionId, quiz.id, navigate])

  const start = () => {
    if (firstQuestionId) navigate(PATHS.app.quizQuestion(quiz.id, firstQuestionId))
  }

  return <QuizIntro quiz={quiz} onStart={start} hasAttempt={hasAttempt} pastScore={pastScore} />
}