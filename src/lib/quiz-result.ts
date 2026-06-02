import type { Question, QuestionOption } from '@/types/quiz'

export type ReviewStatus = 'correct' | 'incorrect' | 'unanswered' | 'ungraded'

export function getCorrectOption(options: QuestionOption[]): QuestionOption | undefined {
  return options.find((o) => o.isCorrect)
}

/**
 * Per-question outcome for the results review. `open_ended` (and any
 * `multi_select` that slips through) is reported as `ungraded` since the
 * backend doesn't score it.
 */
export function getReviewStatus(
  question: Question,
  userAnswer: string | string[] | undefined
): ReviewStatus {
  if (question.type === 'open_ended') {
    const text = typeof userAnswer === 'string' ? userAnswer.trim() : ''
    return text ? 'ungraded' : 'unanswered'
  }

  if (question.type === 'multi_select') return 'ungraded'

  if (typeof userAnswer !== 'string' || !userAnswer) return 'unanswered'

  const correct = getCorrectOption(question.options)
  return correct && correct.id === userAnswer ? 'correct' : 'incorrect'
}

export type ScoreBand = 'high' | 'mid' | 'low'

export function getScoreBand(percentage: number): ScoreBand {
  if (percentage >= 80) return 'high'
  if (percentage >= 50) return 'mid'
  return 'low'
}
