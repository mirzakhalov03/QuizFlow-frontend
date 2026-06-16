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
import Breadcrumb, { type Crumb } from '@/components/ui/breadcrumb'
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

  const {
    mutate: submitMutation,
    isPending,
    isError: submitFailed,
  } = usePost<{ answers: SubmitAnswer[] }, ApiResponse<QuizResult>>()

  const questionMatch = useMatch('/app/quizzes/:id/question/:questionId')
  const resultMatch = useMatch('/app/quizzes/:id/result')
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
    // Drop any cached (stale) result so the result view starts clean — it shows
    // the grading overlay until the finalized result is fetched, with no flash
    // of a previous attempt's score.
    queryClient.removeQueries({ queryKey: [QUIZ_RESULT(id)] })
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
            queryClient.invalidateQueries({ queryKey: [QUIZ_RESULT(id)] })
          },
        }
      )
    },
    [id, submitMutation, clearSavedState, queryClient]
  )

  // Move to the result screen immediately, then fire the request. Grading is a
  // synchronous LLM call, so the result view shows an "evaluating" overlay while
  // the request is in flight, then renders the finalized score. Used for manual
  // submit, timer expiry, and the leave-mid-quiz confirm.
  const submit = useCallback(() => {
    if (!id || !quiz || isPending) return
    const payload = buildSubmitAnswers(quiz.questions, answers)
    goToResult()
    runSubmit(payload)
  }, [id, quiz, answers, isPending, goToResult, runSubmit])

  const { timeRemaining } = useQuizTimer(
    quiz?.timerDuration ?? 0,
    id ? timerKey(id) : 'quiz-timer-none',
    submit,
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
    submitFailed,
    retake,
  }

  const crumbs: Crumb[] = [
    { label: 'Quizzes', to: PATHS.app.quizzes },
    { label: quiz.title, to: PATHS.app.quiz(quiz.id) },
  ]
  if (questionMatch) crumbs.push({ label: `Question ${activeIndex + 1}` })
  else if (resultMatch) crumbs.push({ label: 'Result' })

  return (
    <>
      <Breadcrumb items={crumbs} className="mb-6" />
      <Outlet context={context} />
      <ConfirmDialog
        isOpen={blocker.state === 'blocked'}
        onClose={() => blocker.reset?.()}
        onConfirm={() => {
          blocker.reset?.()
          submit()
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
