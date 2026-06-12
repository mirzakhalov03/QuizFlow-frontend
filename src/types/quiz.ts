export type { ApiResponse, PaginatedResponse } from './api'

export const QUESTION_TYPES = [
  'multiple_choice',
  'multi_select',
  'open_ended',
  'true_false',
  'mixed',
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
  tokenUsage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  } | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  uploadedAt: string | null
  shareToken?: string | null
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

export type SubmitAnswer = {
  questionId: string
  selectedOptionId?: string
  textAnswer?: string
}

export type GradingStatus = 'complete' | 'pending' | 'failed'

export type QuizResult = {
  id: string
  userId: string
  quizId: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  gradingStatus: GradingStatus
}

export type AnswerVerdict = {
  questionId: string
  isCorrect: boolean
}

export type QuizResultResponse = {
  result: QuizResult
  verdicts: AnswerVerdict[]
  answers: SubmitAnswer[]
}
