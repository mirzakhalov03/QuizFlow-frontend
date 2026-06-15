import type { Question, QuestionOption } from '@/types/quiz'

export type ReviewStatus = 'correct' | 'incorrect' | 'unanswered' | 'ungraded' | 'grading'

export function getCorrectOption(options: QuestionOption[]): QuestionOption | undefined {
  return options.find((o) => o.isCorrect)
}

type ReviewContext = {
  /** Verdict for this question once graded (open-ended). Undefined if not yet graded. */
  verdict?: boolean
  /** Whether open-ended grading is still in flight. */
  isGrading?: boolean
}

/**
 * Per-question outcome for the results review. Open-ended is graded
 * asynchronously: while grading is in flight it reports `grading`; once a
 * verdict lands it reports `correct`/`incorrect`; if grading failed (no verdict)
 * it falls back to `ungraded`.
 */
export function getReviewStatus(
  question: Question,
  userAnswer: string | string[] | undefined,
  ctx: ReviewContext = {}
): ReviewStatus {
  if (question.type === 'open_ended') {
    const text = typeof userAnswer === 'string' ? userAnswer.trim() : ''
    if (!text) return 'unanswered'
    if (typeof ctx.verdict === 'boolean') return ctx.verdict ? 'correct' : 'incorrect'
    if (ctx.isGrading) return 'grading'
    return 'ungraded'
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
