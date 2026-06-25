import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useGet } from '@/hooks/useGet'
import { usePost } from '@/hooks/usePost'
import { useQuizTimer } from '@/hooks/useQuizTimer'
import { useAuthStore } from '@/store/use-authstore'
import { buildSubmitAnswers } from '@/lib/quiz-submit'
import { getScoreBand } from '@/lib/quiz-result'
// TODO: re-enable with the "Share result" button (see below).
// import { shareResultImage } from '@/lib/share-image'
import { PATHS } from '@/lib/path'
import { PUBLIC_QUIZ_BY_TOKEN, PUBLIC_QUIZ_SUBMIT, QUIZ_CLONE } from '@/constants/api-endpoints'
import type { ApiResponse } from '@/types/api'
import type { PublicQuiz, PublicReviewItem, PublicSubmitResponse, SubmitAnswer } from '@/types/quiz'

import Spinner from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import LoadingOverlay from '@/components/ui/loading-overlay'
import QuestionCard from '@/components/main/quiz-solving/question-card'
import QuizHeader from '@/components/main/quiz-solving/quiz-header'
import QuizProgress from '@/components/main/quiz-solving/quiz-progress'
import NameGate from '@/components/public/name-gate'
import PublicResultQuestion from '@/components/public/public-result-question'
// TODO: re-enable with the "Share result" button (see below).
// import ResultShareCard from '@/components/public/result-share-card'
import AuthPromptModal from '@/components/public/auth-prompt-modal'

type Phase = 'intro' | 'solving' | 'results'

const GRADING_MESSAGES = [
  'Submitting your answers',
  'Scoring your responses',
  'Calculating your score',
]

export default function PublicQuizView() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data, isLoading, error } = useGet<ApiResponse<PublicQuiz>>(
    PUBLIC_QUIZ_BY_TOKEN(shareToken || '')
  )
  const quiz = data?.data

  const [phase, setPhase] = useState<Phase>('intro')
  const [name, setName] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [result, setResult] = useState<PublicSubmitResponse | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  // TODO: re-enable with the "Share result" button (see below).
  // const shareCardRef = useRef<HTMLDivElement>(null)

  const { mutate: submitMutation, isPending } = usePost<
    { name: string; answers: SubmitAnswer[] },
    ApiResponse<PublicSubmitResponse>
  >()
  const { mutate: cloneMutation } = usePost<Record<string, never>, ApiResponse<{ id: string }>>()

  const handleSubmit = () => {
    if (!quiz || !shareToken || isPending) return
    const payload = buildSubmitAnswers(quiz.questions, answers)
    submitMutation(
      PUBLIC_QUIZ_SUBMIT(shareToken),
      { name, answers: payload },
      {
        onSuccess: (res) => {
          setResult(res.data)
          setPhase('results')
          window.scrollTo({ top: 0 })
        },
      }
    )
  }

  // Honor the quiz timer during the solving phase; auto-submit on expiry.
  const { timeRemaining } = useQuizTimer(
    quiz?.timerDuration ?? 0,
    `public-quiz-timer-${shareToken ?? 'none'}`,
    handleSubmit,
    phase === 'solving' && !!quiz?.isTimerEnabled
  )

  // The owner pasting their own share link is sent to their full, editable copy
  // (results, retake, library) rather than the read-only public view.
  useEffect(() => {
    if (quiz?.isOwner) navigate(PATHS.app.quiz(quiz.id), { replace: true })
  }, [quiz?.isOwner, quiz?.id, navigate])

 
  useEffect(() => {
    if (shareToken) localStorage.removeItem(`public-quiz-timer-${shareToken}`)
  }, [shareToken])

  const reviewByQuestion = useMemo(() => {
    const m = new Map<string, PublicReviewItem>()
    result?.review.forEach((r) => m.set(r.questionId, r))
    return m
  }, [result])
 
  if (isLoading || quiz?.isOwner) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-2xl font-bold">Quiz not found</h1>
        <p className="text-muted-foreground mt-2">
          The link might be invalid or the quiz is no longer public.
        </p>
      </div>
    )
  }

  // A quiz with no questions can't be solved — guard so the solver never lands on
  // an empty stepper ("Question 1 of 0" with a dead Next button).
  if (quiz.questions.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-2xl font-bold">This quiz has no questions yet</h1>
        <p className="text-muted-foreground mt-2">There’s nothing to solve here right now.</p>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <NameGate
        quiz={quiz}
        defaultName={user?.fullName ?? ''}
        onStart={(n) => {
          setName(n)
          setPhase('solving')
        }}
      />
    )
  }

  if (phase === 'solving') {
    const total = quiz.questions.length
    const index = Math.min(currentIndex, Math.max(total - 1, 0))
    const question = quiz.questions[index]
    const isLast = index === total - 1

    return (
      <div className="container mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 md:py-12">
        <QuizHeader
          title={quiz.title}
          timeRemaining={timeRemaining}
          isTimerEnabled={!!quiz.isTimerEnabled}
        />

        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm font-medium">
            Question {index + 1} of {total}
          </p>
          <QuizProgress
            questions={quiz.questions}
            answers={answers}
            activeIndex={index}
            onSelect={setCurrentIndex}
          />
        </div>

        {question && (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id]}
            onChange={(value) => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
          />
        )}

        <div className="flex items-center justify-between gap-4 pb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((i) => i - 1)}
            disabled={index === 0}
          >
            Previous
          </Button>
          {isLast ? (
            <Button onClick={handleSubmit} disabled={isPending}>
              Submit quiz
            </Button>
          ) : (
            <Button onClick={() => setCurrentIndex((i) => i + 1)}>Next</Button>
          )}
        </div>

        {isPending && <LoadingOverlay messages={GRADING_MESSAGES} />}
      </div>
    )
  }

  // results
  const pct =
    result && result.totalQuestions > 0
      ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
      : 0
  const band = getScoreBand(pct)
  const bandText =
    band === 'high'
      ? 'text-emerald-600 dark:text-emerald-400'
      : band === 'mid'
        ? 'text-primary'
        : 'text-destructive'

  const feedbackText =
    band === 'high'
      ? `${pct}% — Outstanding work, ${name}! 🎉`
      : band === 'mid'
        ? `${pct}% — Good effort, ${name}! Keep it up.`
        : `${pct}% — Don't give up, ${name}! Review and try again.`

  const handleClone = () => {
    if (!shareToken || isCloning) return
    setIsCloning(true)
    cloneMutation(
      QUIZ_CLONE(shareToken),
      {},
      {
        onSuccess: (res) => navigate(PATHS.app.quiz(res.data.id)),
        onSettled: () => setIsCloning(false),
      }
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="border-border bg-card mb-8 flex flex-col items-center gap-3 rounded-2xl border p-8 text-center">
        <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">{quiz.title}</p>
        <p className={`font-heading text-5xl font-bold tabular-nums ${bandText}`}>
          {result?.correctAnswers}/{result?.totalQuestions}
        </p>
        <p className="text-muted-foreground text-sm">
          {feedbackText}
        </p>
        <p className="text-muted-foreground text-xs">
          Created by {quiz.owner.fullName} via QuizFlow
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {quiz.questions.map((question, index) => (
          <PublicResultQuestion
            key={question.id}
            question={question}
            index={index}
            review={reviewByQuestion.get(question.id)}
            userAnswer={answers[question.id]}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {/* TODO: re-enable "Share result" (screenshot share/download). Disabled for
            now — needs failure feedback (toast on snapshot error) before shipping.
        <Button
          variant="outline"
          onClick={() => {
            if (shareCardRef.current) shareResultImage(shareCardRef.current, 'quiz-result.png')
          }}
        >
          Share result
        </Button> */}
        {user ? (
          <Button onClick={handleClone} disabled={isCloning}>
            {isCloning ? 'Adding…' : 'Add to my library'}
          </Button>
        ) : (
          <Button onClick={() => setAuthOpen(true)}>Create your own quiz</Button>
        )}
      </div>

      {/* TODO: re-enable with the "Share result" button — off-screen snapshot target.
      <div className="pointer-events-none fixed top-0 -left-[9999px]">
        {result && <ResultShareCard ref={shareCardRef} quizTitle={quiz.title} result={result} />}
      </div> */}

      <AuthPromptModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
