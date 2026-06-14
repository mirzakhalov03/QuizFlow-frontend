import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useBlocker, useMatch, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PATHS } from '@/lib/path'
import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { useQuizTimer } from '@/hooks/useQuizTimer'
import { buildSubmitAnswers } from '@/lib/quiz-submit'
import { QUIZ_BY_ID, QUIZ_RESULT, QUIZ_SUBMIT } from '@/constants/api-endpoints'
import type { QuizResult, QuizWithQuestions, SubmitAnswer } from '@/types/quiz'
import type { ApiResponse } from '@/types/api'
import { useGlobalStore } from '@/store/global-store'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { QUIZ_SOLVING_HEADER_KEY, type QuizSolvingContext, type QuizSolvingHeader } from './context'

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

export default function QuizSolvingLayout() {
  // React Router reuses this route component when navigating between quizzes
  // (only :id changes), so the useState initializers in QuizSolving would keep
  // the previous quiz's answers and timer. Keying on id remounts the subtree,
  // resetting all per-quiz state in one stroke.
  const { id } = useParams<{ id: string }>()
  return <QuizSolving key={id ?? 'none'} />
}

function QuizSolving() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useGet<ApiResponse<QuizWithQuestions>>(QUIZ_BY_ID(id!))
  const quiz = data?.data

  const [answers, setAnswers] = useState<Record<string, string | string[]>>(() =>
    id ? loadSavedAnswers(id) : {}
  )

  const { mutate: submitMutation, isPending } = usePost<
    { answers: SubmitAnswer[] },
    ApiResponse<QuizResult>
  >()

  const questionMatch = useMatch('/app/quizzes/:id/question/:questionId')
  const isSolving = Boolean(questionMatch)

  const clearSavedState = useCallback(() => {
    if (!id) return
    localStorage.removeItem(answersKey(id))
    localStorage.removeItem(timerKey(id))
  }, [id])

  const onAnswerChange = useCallback(
    (questionId: string, value: string | string[]) => {
      // Side effect lives in the event handler (not the setState updater, which
      // must stay pure — concurrent rendering may call it more than once).
      const updated = { ...answers, [questionId]: value }
      setAnswers(updated)
      if (id) localStorage.setItem(answersKey(id), JSON.stringify(updated))
    },
    [id, answers]
  )

  const goToResult = useCallback(() => {
    if (!id) return
    queryClient.invalidateQueries({ queryKey: [QUIZ_RESULT(id)] })
    navigate(PATHS.app.quizResult(id), { replace: true })
  }, [id, navigate, queryClient])

  const runSubmit = useCallback(
    (payload: SubmitAnswer[]) => {
      if (!id) return
      submitMutation(
        QUIZ_SUBMIT(id),
        { answers: payload },
        {
          onSuccess: () => {
            clearSavedState()
            goToResult()
          },
        }
      )
    },
    [id, submitMutation, clearSavedState, goToResult]
  )

  const submit = useCallback(() => {
    if (!id || !quiz || isPending) return
    const payload = buildSubmitAnswers(quiz.questions, answers)
    runSubmit(payload)
  }, [id, quiz, answers, isPending, runSubmit])

  const handleAutoSubmit = useCallback(() => {
    if (!id || !quiz) return
    const payload = buildSubmitAnswers(quiz.questions, answers)
    if (payload.length === 0) {
      clearSavedState()
      runSubmit(payload)
      goToResult()
      return
    }
    runSubmit(payload)
  }, [id, quiz, answers, clearSavedState, goToResult, runSubmit])

  const { timeRemaining } = useQuizTimer(
    quiz?.timerDuration ?? 0,
    id ? timerKey(id) : 'quiz-timer-none',
    handleAutoSubmit,
    isSolving && !!quiz?.isTimerEnabled
  )

  const blocker = useBlocker(({ nextLocation }) => {
    const isMovingToResult = nextLocation.pathname.includes(`/quizzes/${id}/result`)
    const isStayingInQuestionFlow = nextLocation.pathname.includes(`/quizzes/${id}/question/`)
    return isSolving && !isMovingToResult && !isStayingInQuestionFlow
  })

  useEffect(() => {
    if (!isSolving) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isSolving])

  const retake = useCallback(() => {
    if (!id) return
    localStorage.removeItem(answersKey(id))
    localStorage.removeItem(timerKey(id))
    setAnswers({})
    queryClient.removeQueries({ queryKey: [QUIZ_RESULT(id)] })
    navigate(PATHS.app.quiz(id))
  }, [id, navigate, queryClient])

  const activeIndex = useMemo(() => {
    if (!quiz || !questionMatch) return 0
    const idx = quiz.questions.findIndex((q) => q.id === questionMatch.params.questionId)
    return idx === -1 ? 0 : idx
  }, [quiz, questionMatch])

  const onSelectQuestion = useCallback(
    (index: number) => {
      if (!id || !quiz) return
      const target = quiz.questions[index]
      if (target) navigate(PATHS.app.quizQuestion(id, target.id))
    },
    [id, quiz, navigate]
  )

  const setData = useGlobalStore((s) => s.setData)
  const clearKey = useGlobalStore((s) => s.clearKey)

  useEffect(() => {
    if (!isSolving || !quiz) {
      clearKey(QUIZ_SOLVING_HEADER_KEY)
      return
    }
    setData<QuizSolvingHeader>(QUIZ_SOLVING_HEADER_KEY, {
      title: quiz.title,
      timeRemaining,
      isTimerEnabled: quiz.isTimerEnabled,
      questions: quiz.questions,
      answers,
      activeIndex,
      onSelect: onSelectQuestion,
    })
  }, [isSolving, quiz, timeRemaining, answers, activeIndex, onSelectQuestion, setData, clearKey])

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

  const context: QuizSolvingContext = {
    quiz,
    answers,
    onAnswerChange,
    submit,
    isSubmitting: isPending,
    retake,
  }

  return (
    <>
      <Outlet context={context} />
      <ConfirmDialog
        isOpen={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        onConfirm={() => {
          blocker.reset?.()
          handleAutoSubmit()
        }}
        title="Leave quiz?"
        description="If you leave now, your quiz will be automatically submitted with your current answers."
        confirmLabel="Submit and leave"
        cancelLabel="Stay"
        variant="destructive"
        loading={isPending}
      />
    </>
  )
}
