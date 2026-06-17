/**
 * Per-quiz in-progress state (answers + timer) is persisted to localStorage so a
 * reload mid-quiz doesn't lose progress. Keys are namespaced by quiz id.
 */
type SavedAnswers = Record<string, string | string[]>

const answersKey = (quizId: string) => `quiz-answers-${quizId}`

/** Storage key for the running quiz timer; passed through to `useQuizTimer`. */
export const timerStorageKey = (quizId: string) => `quiz-timer-${quizId}`

export function loadSavedAnswers(quizId: string): SavedAnswers {
  try {
    const saved = localStorage.getItem(answersKey(quizId))
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore corrupt data
  }
  return {}
}

export function saveAnswers(quizId: string, answers: SavedAnswers) {
  localStorage.setItem(answersKey(quizId), JSON.stringify(answers))
}

/** Clears both persisted answers and the timer for a quiz (on submit or retake). */
export function clearQuizState(quizId: string) {
  localStorage.removeItem(answersKey(quizId))
  localStorage.removeItem(timerStorageKey(quizId))
}
