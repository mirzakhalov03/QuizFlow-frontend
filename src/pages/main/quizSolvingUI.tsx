import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import { useGet } from '@/hooks/useGet'
import { useQuizTimer } from '@/hooks/useQuizTimer'
import { QUIZ_BY_ID } from '@/constants/api-endpoints'
import type { ApiResponse, Question, QuizWithQuestions } from '@/types/quiz'
import { useGlobalStore } from '@/store/global-store'

import QuizIntro from '@/components/main/quiz-solving/quiz-intro'
import QuestionCard from '@/components/main/quiz-solving/question-card'
import QuizSubmitted from '@/components/main/quiz-solving/quiz-submitted'

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

  const handleSubmit = useCallback(() => {
    if (!id) return
    localStorage.removeItem(answersKey(id))
    localStorage.removeItem(timerKey(id))
    setPhase('submitted')
    // TODO: POST /quizzes/:id/submit when backend endpoint is ready
    // Payload shape:
    // {
    //   answers: quiz.questions.map(q => ({
    //     questionId: q.id,
    //     selectedOptionIds: q.type !== 'open_ended'
    //       ? (Array.isArray(answers[q.id]) ? answers[q.id] : answers[q.id] ? [answers[q.id]] : [])
    //       : undefined,
    //     textAnswer: q.type === 'open_ended' ? answers[q.id] : undefined,
    //   }))
    // }
  }, [id])

  const { timeRemaining } = useQuizTimer(
    quiz?.timerDuration ?? 0,
    id ? timerKey(id) : 'quiz-timer-none',
    handleSubmit,
    phase === 'solving' && !!quiz?.isTimerEnabled
  )

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const updated = { ...answers, [questionId]: value }
    setAnswers(updated)
    if (id) localStorage.setItem(answersKey(id), JSON.stringify(updated))
  }

  const handleSelectProgress = useCallback((index: number) => {
    setActiveIndex(index)
    document
      .getElementById(`question-${index}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
    return <QuizSubmitted quizTitle={quiz.title} />
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

  return (
    <div className="flex flex-col gap-5">
      {quiz.questions.map((question, i) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={i}
          value={answers[question.id]}
          onChange={(value) => handleAnswerChange(question.id, value)}
        />
      ))}

      <div className="flex justify-end pb-8">
        <Button onClick={handleSubmit}>Submit Quiz</Button>
      </div>
    </div>
  )
}
