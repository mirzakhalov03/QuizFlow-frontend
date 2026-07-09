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
  folderId: string | null
  type: QuestionType
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
  isPublic?: boolean
  isPublished?: boolean
  apiKeyId?: string | null
  apiKeyName?: string | null
  properties?: {
    model?: string
    source?: unknown
    generatedBy?: string
  } | null
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

/**
 * Minimal shapes the solving UI actually consumes. Both the full `Question` and
 * the answer-stripped `PublicQuestion` satisfy these, so the shared solving
 * components stay typed across both flows without casts — and can never read an
 * answer field (isCorrect/explanation) that the public payload omits.
 */
export type SolvableOption = {
  id: string
  text: string
}

export type SolvableQuestion = {
  id: string
  text: string
  type: QuestionType
  options: SolvableOption[]
}

export type SubmitAnswer = {
  questionId: string
  selectedOptionId?: string
  selectedOptionIds?: string[]
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

/** A question's options as exposed publicly — no isCorrect / explanation. */
export type PublicQuestionOption = {
  id: string
  questionId: string
  text: string
  position: number
}

export type PublicQuestion = {
  id: string
  quizId: string
  text: string
  type: QuestionType
  position: number
  options: PublicQuestionOption[]
}

export type PublicQuiz = {
  id: string
  title: string
  userInstructions: string | null
  type: QuestionType | null
  isTimerEnabled: boolean
  timerDuration: number | null
  isOwner?: boolean
  owner: { fullName: string }
  questions: PublicQuestion[]
}

export type PublicReviewItem = {
  questionId: string
  /** null = an answered open-ended that couldn't be graded (LLM outage) — render as "Not graded". */
  isCorrect: boolean | null
  correctOptionIds: string[]
  modelAnswer?: string
}

export type PublicSubmitResponse = {
  name: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  review: PublicReviewItem[]
}

export type BookmarkItem = {
  bookmarkId: string
  bookmarkedAt: string
  quiz: {
    id: string
    title: string
  }
  question: {
    id: string
    text: string
    type: QuestionType
    correctOptions: {
      id: string
      text: string
      explanation: string | null
    }[]
    modelAnswer: string | null
  }
}

