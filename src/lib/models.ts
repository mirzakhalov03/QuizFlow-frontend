export type AIModel = {
  /** OpenRouter-style model identifier used by the API */
  value: string
  /** Human-readable display name */
  label: string
  /** Provider / company name */
  provider: string
  /** Brand color for charts, badges, and indicators */
  color: string
}

/** The full list of supported AI models. */
export const AI_MODELS: AIModel[] = [
  {
    value: 'google/gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    provider: 'Google',
    color: '#14B8A6',
  },
  {
    value: 'google/gemini-2.5-flash',
    label: 'Google 2.5 Flash',
    provider: 'Google',
    color: '#14B8A6',
  },

  {
    value: 'openai/gpt-4.1-mini',
    label: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    color: '#10B981',
  },
  {
    value: 'openai/gpt-4o',
    label: 'GPT-4o',
    provider: 'OpenAI',
    color: '#10B981',
  },
  {
    value: 'deepseek/deepseek-chat-v3',
    label: 'DeepSeek V3',
    provider: 'DeepSeek',
    color: '#3B82F6',
  },
  {
    value: 'deepseek/deepseek-r1',
    label: 'DeepSeek R1',
    provider: 'DeepSeek',
    color: '#3B82F6',
  },
  {
    value: 'meta-llama/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B',
    provider: 'Meta',
    color: '#A855F7',
  },
  {
    value: 'meta-llama/llama-4-maverick',
    label: 'Llama 4 Maverick',
    provider: 'Meta',
    color: '#A855F7',
  },

  {
    value: 'mistralai/mistral-small-2603',
    label: 'Mistral Small 4',
    provider: 'Mistral',
    color: '#F97316',
  },
  {
    value: 'anthropic/claude-3-haiku',
    label: 'Claude 3 Haiku',
    provider: 'Anthropic',
    color: '#B45309',
  },
]

/** Fallback used when a model value is not found in the registry. */
const UNKNOWN_MODEL: AIModel = {
  value: '',
  label: '',
  provider: 'AI Provider',
  color: '#64748B', // Slate
}

/** The default model used when no model is specified. */
export const DEFAULT_MODEL = AI_MODELS[0].value

/**
 * Look up an AI model by its API value string.
 * Returns a fallback descriptor (with the raw value as the label) if the model
 * is not found in the registry, so the UI always has something useful to show.
 */
export function getModelByValue(value: string): AIModel {
  return AI_MODELS.find((m) => m.value === value) ?? { ...UNKNOWN_MODEL, value, label: value }
}

/**
 * A lookup map keyed by model value, derived from AI_MODELS.
 * Useful for O(1) access when iterating over many items.
 */
export const MODEL_MAP: Readonly<Record<string, AIModel>> = Object.fromEntries(
  AI_MODELS.map((m) => [m.value, m])
)
