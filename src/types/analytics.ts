import type { QuestionType } from './quiz'

export type ScorePoint = {
  date: string
  score: number
  quizId: string
  quizTitle: string
}

export type TypeBreakdown = {
  type: QuestionType
  questionCount: number
}

export type FolderTypeBreakdown = {
  folderId: string | null
  typeBreakdown: TypeBreakdown[]
}

export type FolderStat = {
  folderId: string | null
  folderName: string
  averageScore: number
  bestScore: number
  attemptCount: number
}

export type QuizStat = {
  quizId: string
  quizTitle: string
  folderId: string | null
  averageScore: number
  bestScore: number
  attemptCount: number
}

export type QuizHistoryItem = {
  quizId: string
  quizTitle: string
  correctAnswers: number
  totalQuestions: number
  score: number
  date: string
}

export type HistoryItem = {
  resultId: string
  quizId: string
  quizTitle: string
  folderId: string | null
  folderName: string | null
  score: number
  correctAnswers: number
  totalQuestions: number
  completedAt: string
}

export type HistorySort = 'recent' | 'best' | 'worst'

export type KeyUsageSummary = {
  keyId: string | null
  keyName: string
  tokensUsed: number
  quizCount: number
  percentage: number
}

export type ModelUsageSummary = {
  modelName: string
  tokensUsed: number
  quizCount: number
  percentage: number
}

export type AnalyticsSummary = {
  totalQuizzesTaken: number
  averageScore: number
  totalTokensUsed: number
  keyUsageBreakdown: KeyUsageSummary[]
  modelUsageBreakdown: ModelUsageSummary[]
  scoreOverTime: ScorePoint[]
  typeBreakdown: TypeBreakdown[]
  typeBreakdownByFolder: FolderTypeBreakdown[]
  folderStats: FolderStat[]
  quizStats: QuizStat[]
  history: QuizHistoryItem[]
}
