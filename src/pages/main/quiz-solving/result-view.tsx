import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useGet } from '@/hooks/useGet'
import { QUIZ_RESULT } from '@/constants/api-endpoints'
import { PATHS } from '@/lib/path'
import type { ApiResponse } from '@/types/api'
import type { QuizResultResponse } from '@/types/quiz'
import QuizSubmitted from '@/components/main/quiz-solving/quiz-submitted'
import { useQuizSolving } from './context'

export default function QuizResultView() {
  const { quiz, retake } = useQuizSolving()

  const { data, isLoading } = useGet<ApiResponse<QuizResultResponse>>(QUIZ_RESULT(quiz.id), {
    options: {
      staleTime: 0,
      refetchInterval: (query) => {
        const payload = query.state.data as ApiResponse<QuizResultResponse> | undefined
        return payload?.data?.result?.gradingStatus === 'pending' ? 2000 : false
      },
    },
  })

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
      acc[a.questionId] = a.selectedOptionId ?? a.textAnswer ?? ''
      return acc
    }, {})
  }, [payload])

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
      isGrading={result.gradingStatus === 'pending'}
      onRetake={retake}
    />
  )
}
