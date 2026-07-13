import { useCallback, useEffect, useMemo, useState } from 'react'
import { Outlet, useBlocker, useMatch, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PATHS } from '@/lib/path'
import Spinner from '@/components/ui/spinner'
import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { useQuizTimer } from '@/hooks/useQuizTimer'
import { buildSubmitAnswers } from '@/lib/quiz-submit'
import { clearQuizState, loadSavedAnswers, saveAnswers, timerStorageKey } from '@/lib/quiz-storage'
import { QUIZ_BY_ID, QUIZ_RESULT, QUIZ_SUBMIT } from '@/constants/api-endpoints'
import type { QuizResult, QuizWithQuestions, SubmitAnswer } from '@/types/quiz'
import type { ApiResponse } from '@/types/api'
import { useGlobalStore } from '@/store/global-store'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import Breadcrumb, { type Crumb } from '@/components/ui/breadcrumb'
import LoadingOverlay from '@/components/ui/loading-overlay'
import { QUIZ_SOLVING_HEADER_KEY, type QuizSolvingContext, type QuizSolvingHeader } from './context'

const GRADING_MESSAGES = [
  'Submitting your answers',
  'Evaluating your responses',
  'Comparing against the model answer',
  'Calculating your score',
  'Almost there',
]

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
  const resultMatch = useMatch('/app/quizzes/:id/result')
  const isSolving = Boolean(questionMatch)

  const clearSavedState = useCallback(() => {
    if (!id) return
    clearQuizState(id)
  }, [id])

  const onAnswerChange = useCallback(
    (questionId: string, value: string | string[]) => {
      // Side effect lives in the event handler (not the setState updater, which
      // must stay pure — concurrent rendering may call it more than once).
      const updated = { ...answers, [questionId]: value }
      setAnswers(updated)
      if (id) saveAnswers(id, updated)
    },
    [id, answers]
  )

  const goToResult = useCallback(() => {
    if (!id) return
    // Drop any cached (stale) result so the view fetches the just-persisted
    // attempt fresh — no flash of a previous attempt's score/answers.
    queryClient.removeQueries({ queryKey: [QUIZ_RESULT(id)] })
    navigate(PATHS.app.quizResult(id), { replace: true })
  }, [id, navigate, queryClient])

  // Navigate to the result screen only AFTER the submit (incl. synchronous LLM
  // grading) has committed — fetching earlier would read the previous attempt's
  // rows. The full-screen grading overlay (driven by `isPending` below) covers
  // the wait. On error we stay put; usePost surfaces a toast via handleFormError.
  const runSubmit = useCallback(
  (payload: SubmitAnswer[]) => {
    if (!id) return
    submitMutation(
      QUIZ_SUBMIT(id),
      { answers: payload },
      {
        onSuccess: () => {
          clearSavedState()
          // The server now has completedAt set on this quiz, but our cached
          // QUIZ_BY_ID entry doesn't know that yet — invalidate so navigating
          // back to the intro screen shows "You scored X% last time" without
          // requiring a hard reload.
          queryClient.invalidateQueries({ queryKey: [QUIZ_BY_ID(id)] })
          goToResult()
        },
      }
    )
  },
  [id, submitMutation, clearSavedState, goToResult, queryClient]
)

  // Fires the submit and shows the grading overlay; used for manual submit,
  // timer expiry, and the leave-mid-quiz confirm.
  const submit = useCallback(() => {
    if (!id || !quiz || isPending) return
    const payload = buildSubmitAnswers(quiz.questions, answers)
    runSubmit(payload)
  }, [id, quiz, answers, isPending, runSubmit])

  const { timeRemaining } = useQuizTimer(
    quiz?.timerDuration ?? 0,
    id ? timerStorageKey(id) : 'quiz-timer-none',
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
    clearQuizState(id)
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
        <Spinner size="lg" />
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
      {/* Full-screen overlay during submit. Grading is a synchronous LLM call,
          so this covers the wait, then we navigate to the result on success. */}
      {isPending && <LoadingOverlay messages={GRADING_MESSAGES} />}
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
