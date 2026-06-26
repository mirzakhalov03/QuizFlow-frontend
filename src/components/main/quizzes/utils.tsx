/* eslint-disable react-refresh/only-export-components */
import type { QuestionType } from '@/types/quiz'
import { DEFAULT_MODEL } from '@/lib/models'
export { SORTED_AI_MODELS as aiModels, DEFAULT_MODEL } from '@/lib/models'

/**
 * The quiz-settings fields shared by both the file-upload and Notion quiz forms.
 * Each form's own value type extends this with its source field (`files` /
 * `pageIds`), so `QuizSettingsFields` can render against any of them.
 */
export type QuizSettingsValues = {
  type: QuestionType
  questionCount: string
  difficulty: string
  model: string
  apiKeyId: string
  isTimerEnabled: boolean
  timerDuration?: number
  userInstructions?: string
  folderId: string
  avoidQuizIds?: string[]
}

/** Timer minutes → seconds for the create-quiz API; undefined when the timer is off. */
export const toTimerSeconds = (enabled: boolean, minutes?: number): number | undefined =>
  enabled ? (minutes ?? 0) * 60 : undefined

export const questionTypes = [
  { label: 'Multiple Choice', value: 'multiple_choice' },
  { label: 'True/False', value: 'true_false' },
  { label: 'Multi Select', value: 'multi_select' },
  { label: 'Open Ended', value: 'open_ended' },
  { label: 'Mixed', value: 'mixed' },
]

export const questionCounts = [
  { label: '5 Questions', value: '5' },
  { label: '10 Questions', value: '10' },
  { label: '15 Questions', value: '15' },
  { label: '20 Questions', value: '20' },
  { label: '25 Questions', value: '25' },
  { label: '30 Questions', value: '30' },
]

/**
 * The model selector mixes built-in models with the user's BYOK keys. BYOK
 * options are encoded as `byok:<keyId>` so a single value can represent either.
 */
const BYOK_OPTION_PREFIX = 'byok:'

export const buildByokOptionValue = (keyId: string) => `${BYOK_OPTION_PREFIX}${keyId}`

/** Decodes a model-selector value into the fields the create-quiz API expects. */
export const parseModelSelection = (value: string): { model: string; apiKeyId?: string } =>
  value.startsWith(BYOK_OPTION_PREFIX)
    ? { model: DEFAULT_MODEL, apiKeyId: value.slice(BYOK_OPTION_PREFIX.length) }
    : { model: value }

export const difficulties = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
]

export const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  multi_select: 'Multi Select',
  true_false: 'True / False',
  open_ended: 'Open Ended',
  mixed: 'Mixed',
}

export const TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  multi_select: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  true_false: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  open_ended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  mixed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
}
