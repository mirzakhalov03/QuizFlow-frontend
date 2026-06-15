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

export type AnalyticsSummary = {
  totalQuizzesTaken: number
  averageScore: number
  scoreOverTime: ScorePoint[]
  breakdownByType: TypeBreakdown[]
  history: QuizHistoryItem[]
}
