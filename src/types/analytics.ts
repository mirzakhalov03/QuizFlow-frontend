import type { QuestionType } from './quiz'

export type ScorePoint = {
  date: string
  score: number
}

export type TypeBreakdown = {
  type: QuestionType
  quizCount: number
  averageScore: number
}

export type QuizHistoryItem = {
  quizId: string
  quizTitle: string
  correctAnswers: number
  totalQuestions: number
  score: number
  date: string
}

export type KeyUsageSummary = {
  keyId: string | null
  keyName: string
  tokensUsed: number
  quizCount: number
  percentage: number
}

export type AnalyticsSummary = {
  totalQuizzesTaken: number
  averageScore: number
  totalTokensUsed: number
  keyUsageBreakdown: KeyUsageSummary[]
  scoreOverTime: ScorePoint[]
  breakdownByType: TypeBreakdown[]
  history: QuizHistoryItem[]
}
