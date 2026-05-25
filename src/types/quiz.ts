export const QUESTION_TYPES = [
  'multiple_choice',
  'multi_select',
  'open_ended',
  'true_false',
] as const

export type QuestionType = (typeof QUESTION_TYPES)[number]

export type Quiz = {
  id: string
  title: string
  userId: string
  type: QuestionType | null
  difficulty: string | null
  isTimerEnabled: boolean
  timerDuration: number | null
  userInstructions: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  uploadedAt: string | null
}

export type QuizJob = {
  id: string
  userId: string
  quizId: string | null
  status: 'pending' | 'done' | 'failed'
  requestId: string | null
  error: string | null
  createdAt: string
  updatedAt: string
}

export type QuestionOption = {
  id: string
  questionId: string
  text: string
  explanation: string | null
  isCorrect: boolean
  position: number
  createdAt: string
  updatedAt: string
}

export type Question = {
  id: string
  quizId: string
  text: string
  type: QuestionType
  position: number
  options: QuestionOption[]
  createdAt: string
  updatedAt: string
}

export type QuizWithQuestions = Quiz & {
  questions: Question[]
}

export type ApiResponse<T> = {
  success: boolean
  data: T
}

export type PaginatedResponse<T> = ApiResponse<{
  items: T[]
  pagination: { limit: number; offset: number; count: number }
}>
