import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import { toast } from '@/lib/toast'
import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { useQuizTimer } from '@/hooks/useQuizTimer'
import { buildSubmitAnswers, hasUngradableQuestions } from '@/lib/quiz-submit'
import { QUIZ_BY_ID, QUIZ_SUBMIT } from '@/constants/api-endpoints'
import type { Question, QuizResult, QuizWithQuestions, SubmitAnswer } from '@/types/quiz'
import type { ApiResponse } from '@/types/api'
import { useGlobalStore } from '@/store/global-store'

import QuizIntro from '@/components/main/quiz-solving/quiz-intro'
import QuestionCard from '@/components/main/quiz-solving/question-card'
import QuizSubmitted from '@/components/main/quiz-solving/quiz-submitted'
import QuizProgress from '@/components/main/quiz-solving/quiz-progress'

export type QuizSolvingHeader = {
  title: string
  timeRemaining: number
  isTimerEnabled: boolean
  questions: Question[]
  answers: Record<string, string | string[]>
  activeIndex: number
  onSelect: (index: number) => void
}

export const QUIZ_SOLVING_HEADER_KEY = 'quiz-solving-header'

type Phase = 'intro' | 'solving' | 'submitted'

function answersKey(quizId: string) {
  return `quiz-answers-${quizId}`
}

function timerKey(quizId: string) {
  return `quiz-timer-${quizId}`
}

function loadSavedAnswers(quizId: string): Record<string, string | string[]> {
  try {
    const saved = localStorage.getItem(answersKey(quizId))
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore corrupt data
  }
  return {}
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useGet<ApiResponse<QuizWithQuestions>>(QUIZ_BY_ID(id!))
  const quiz = data?.data

  const [phase, setPhase] = useState<Phase>('intro')
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() =>
    id ? loadSavedAnswers(id) : {}
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [result, setResult] = useState<QuizResult | null>(null)

  const { mutate: submit, isPending } = usePost<
    { answers: SubmitAnswer[] },
    ApiResponse<QuizResult>
  >()

  const containsMultiSelect = quiz ? hasUngradableQuestions(quiz.questions) : false

  const clearSavedState = useCallback(() => {
    if (!id) return
    localStorage.removeItem(answersKey(id))
    localStorage.removeItem(timerKey(id))
  }, [id])

  const submitAnswers = useCallback(
    (payload: SubmitAnswer[]) => {
      if (!id) return
      submit(
        QUIZ_SUBMIT(id),
        { answers: payload },
        {
          onSuccess: (res) => {
            clearSavedState()
            setResult(res.data ?? null)
            setPhase('submitted')
          },
          // Errors surface via handleFormError (toast); stay on the solving phase
          // so the user keeps their answers and can retry.
        }
      )
    },
    [id, submit, clearSavedState]
  )

  // Manual submit: require at least one gradable answer, otherwise nudge.
  const handleSubmit = useCallback(() => {
    if (!id || !quiz || isPending) return
    const payload = buildSubmitAnswers(quiz.questions, answers)
    if (payload.length === 0) {
      toast.error('Answer at least one question before submitting.')
      return
    }
    submitAnswers(payload)
  }, [id, quiz, answers, isPending, submitAnswers])

  // Timer expiry: submit whatever has been answered. Multi-select quizzes can't
  // be graded yet (manual submit is disabled), so go straight to the unscored
  // review rather than POST a partial, misleadingly-low score.
  const handleAutoSubmit = useCallback(() => {
    if (!id || !quiz) return
    const payload = containsMultiSelect ? [] : buildSubmitAnswers(quiz.questions, answers)
    if (payload.length === 0) {
      clearSavedState()
      setResult(null)
      setPhase('submitted')
      return
    }
    submitAnswers(payload)
  }, [id, quiz, answers, containsMultiSelect, submitAnswers, clearSavedState])

  const { timeRemaining } = useQuizTimer(
    quiz?.timerDuration ?? 0,
    id ? timerKey(id) : 'quiz-timer-none',
    handleAutoSubmit,
    phase === 'solving' && !!quiz?.isTimerEnabled
  )

  const handleRetake = useCallback(() => {
    if (!id) return
    localStorage.removeItem(answersKey(id))
    localStorage.removeItem(timerKey(id))
    setAnswers({})
    setResult(null)
    setActiveIndex(0)
    setPhase('intro')
  }, [id])

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const updated = { ...answers, [questionId]: value }
    setAnswers(updated)
    if (id) localStorage.setItem(answersKey(id), JSON.stringify(updated))
  }

  const handleSelectProgress = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  const setData = useGlobalStore((s) => s.setData)
  const clearKey = useGlobalStore((s) => s.clearKey)

  useEffect(() => {
    if (phase !== 'solving' || !quiz) return
    setData<QuizSolvingHeader>(QUIZ_SOLVING_HEADER_KEY, {
      title: quiz.title,
      timeRemaining,
      isTimerEnabled: quiz.isTimerEnabled,
      questions: quiz.questions,
      answers,
      activeIndex,
      onSelect: handleSelectProgress,
    })
  }, [phase, quiz, timeRemaining, answers, activeIndex, handleSelectProgress, setData])

  useEffect(() => {
    return () => clearKey(QUIZ_SOLVING_HEADER_KEY)
  }, [clearKey])

  if (isLoading || !quiz) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  if (phase === 'submitted') {
    return (
      <QuizSubmitted
        quizTitle={quiz.title}
        result={result}
        questions={quiz.questions}
        answers={answers}
        onRetake={handleRetake}
      />
    )
  }

  if (phase === 'intro') {
    return (
      <div className="space-y-6">
        <Link to={PATHS.app.quizzes}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to quizzes
          </Button>
        </Link>
        <QuizIntro quiz={quiz} onStart={() => setPhase('solving')} />
      </div>
    )
  }
  if (quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">This quiz has no questions.</p>
      </div>
    )
  }
  const currentQuestion = quiz.questions[activeIndex]
  const isLastQuestion = activeIndex === quiz.questions.length - 1

  return (
    <div className="flex flex-col gap-6">
      <div className="lg:hidden">
        <QuizProgress
          questions={quiz.questions}
          answers={answers}
          activeIndex={activeIndex}
          onSelect={handleSelectProgress}
        />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        index={activeIndex}
        value={answers[currentQuestion.id]}
        onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
      />

      <div className="flex items-center justify-between gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => setActiveIndex((p) => Math.max(0, p - 1))}
          disabled={activeIndex === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {isLastQuestion ? (
            <Button onClick={handleSubmit} disabled={containsMultiSelect || isPending}>
              {isPending ? 'Submitting…' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={() => setActiveIndex((p) => Math.min(quiz.questions.length - 1, p + 1))}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {containsMultiSelect && isLastQuestion && (
        <p className="text-muted-foreground -mt-4 text-center text-sm">
          Multi-select quizzes aren’t gradable yet — submission is disabled.
        </p>
      )}
    </div>
  )
}
