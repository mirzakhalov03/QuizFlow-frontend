import type { QuestionType } from '@/types/quiz'

export const questionTypes = [
  { label: 'Multiple Choice', value: 'multiple_choice' },
  { label: 'True/False', value: 'true_false' },
  { label: 'Multi Select', value: 'multi_select' },
  { label: 'Open Ended', value: 'open_ended' },
  { label: 'Mixed (Auto)', value: 'mixed' },
]

export const questionCounts = [
  { label: '5 Questions', value: '5' },
  { label: '10 Questions', value: '10' },
  { label: '15 Questions', value: '15' },
  { label: '20 Questions', value: '20' },
  { label: '25 Questions', value: '25' },
  { label: '30 Questions', value: '30' },
]

export const aiModels = [
  { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash-001' },
  { label: 'GPT-4o Mini', value: 'openai/gpt-4o-mini' },
  { label: 'DeepSeek V3', value: 'deepseek/deepseek-chat-v3' },
  { label: 'Llama 3.3 70B', value: 'meta-llama/llama-3.3-70b-instruct' },
]

export const DEFAULT_MODEL = aiModels[0].value

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
  mixed: 'Mixed (Auto)',
}

export const TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  multi_select: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  true_false: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  open_ended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  mixed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
}
