import type { Question, SubmitAnswer } from '@/types/quiz'

type AnswersState = Record<string, string | string[] | undefined>

/**
 * Whether the quiz contains question types the submit pipeline can't grade yet.
 * Today that's `multi_select`: the backend stores one option per question and
 * scores a single correct option, so multi-answer questions can't be represented.
 */
export function hasUngradableQuestions(questions: Question[]): boolean {
  return questions.some((q) => q.type === 'multi_select')
}

/**
 * Maps the local answers state into the API submit payload. Drops unanswered
 * questions (so we never send an empty `selectedOptionId`, which fails UUID
 * validation) and skips `multi_select`, which the backend can't grade.
 */
export function buildSubmitAnswers(questions: Question[], answers: AnswersState): SubmitAnswer[] {
  const payload: SubmitAnswer[] = []

  for (const question of questions) {
    const value = answers[question.id]

    if (question.type === 'open_ended') {
      const text = typeof value === 'string' ? value.trim() : ''
      if (text) payload.push({ questionId: question.id, textAnswer: text })
      continue
    }

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      if (typeof value === 'string' && value) {
        payload.push({ questionId: question.id, selectedOptionId: value })
      }
      continue
    }

    // multi_select / mixed: not gradable by the current backend — skip.
  }

  return payload
}
