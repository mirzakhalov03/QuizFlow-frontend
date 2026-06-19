import type { SolvableQuestion, SubmitAnswer } from '@/types/quiz'

type AnswersState = Record<string, string | string[] | undefined>

/**
 * Maps the local answers state into the API submit payload. Drops unanswered
 * questions (so we never send an empty option id, which fails UUID validation).
 */
export function buildSubmitAnswers(
  questions: SolvableQuestion[],
  answers: AnswersState
): SubmitAnswer[] {
  const payload: SubmitAnswer[] = []

  for (const question of questions) {
    const value = answers[question.id]

    if (question.type === 'open_ended') {
      const text = typeof value === 'string' ? value.trim() : ''
      if (text) payload.push({ questionId: question.id, textAnswer: text })
      continue
    }

    if (question.type === 'multi_select') {
      const ids = Array.isArray(value) ? value.filter(Boolean) : []
      if (ids.length > 0) payload.push({ questionId: question.id, selectedOptionIds: ids })
      continue
    }

    // multiple_choice / true_false
    if (typeof value === 'string' && value) {
      payload.push({ questionId: question.id, selectedOptionId: value })
    }
  }

  return payload
}
