import { useOutletContext } from 'react-router-dom'
import type { Question, QuizWithQuestions } from '@/types/quiz'

/** Global-store key for the top-bar progress/timer bridge. */
export const QUIZ_SOLVING_HEADER_KEY = 'quiz-solving-header'

export type QuizSolvingHeader = {
  title: string
  timeRemaining: number
  isTimerEnabled: boolean
  questions: Question[]
  answers: Record<string, string | string[]>
  activeIndex: number
  onSelect: (index: number) => void
}

/** Shared state the layout exposes to its child views via <Outlet context>. */
export type QuizSolvingContext = {
  quiz: QuizWithQuestions
  answers: Record<string, string | string[]>
  onAnswerChange: (questionId: string, value: string | string[]) => void
  submit: () => void
  isSubmitting: boolean
  retake: () => void
}

export function useQuizSolving() {
  return useOutletContext<QuizSolvingContext>()
}
