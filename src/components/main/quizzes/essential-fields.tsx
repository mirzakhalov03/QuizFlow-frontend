import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'
import { Settings2 } from 'lucide-react'

import { FormSelect } from '@/components/form/form-select'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormInput from '@/components/form/input'
import {
  difficulties,
  questionCounts,
  questionTypes,
  type QuizFormValues,
} from '@/components/main/quizzes/utils'

/** Screen 2 essentials — the smart-defaulted decisions that shape the quiz. */
export default function EssentialFields({ form }: { form: UseFormReturn<QuizFormValues> }) {
  const { control } = form
  const timerEnabled = useWatch({ control, name: 'isTimerEnabled' }) ?? false

  return (
    <div className="bg-muted/30 border-border/50 space-y-4 rounded-xl border p-4">
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <Settings2 className="text-primary h-4 w-4" />
        Quiz Settings
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormSelect label="Question Type" options={questionTypes} name="type" control={control} required />
        <FormSelect label="Question Count" options={questionCounts} name="questionCount" control={control} required />
      </div>

      <OptionsPerQuestionField form={form} />

      <FormSelect label="Difficulty" options={difficulties} name="difficulty" control={control} required />

      <FormCheckbox label="Enable Timer" control={control} name="isTimerEnabled" />

      {timerEnabled && (
        <FormInput
          name="timerDuration"
          methods={form}
          label="Timer (minutes)"
          type="number"
          min={1}
          onKeyDown={(e) => {
            if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault()
          }}
          registerOptions={{
            min: { value: 1, message: 'Minimum 1 minute' },
            max: { value: 180, message: 'Maximum 180 minutes' },
            valueAsNumber: true,
          }}
          required
        />
      )}
    </div>
  )
}

const OPTIONS_RANGE = [2, 3, 4, 5, 6] as const
const OPTION_BASED_TYPES: QuizFormValues['type'][] = ['multiple_choice', 'multi_select']

function OptionsPerQuestionField({ form }: { form: UseFormReturn<QuizFormValues> }) {
  const selectedType = useWatch({ control: form.control, name: 'type' }) as string
  if (!OPTION_BASED_TYPES.includes(selectedType as QuizFormValues['type'])) return null

  return (
    <div className="flex flex-col gap-2">
      <label className="text-foreground text-sm font-medium">Options per question</label>
      <Controller
        name="optionsPerQuestion"
        control={form.control}
        render={({ field }) => (
          <div className="flex gap-2" role="group" aria-label="Number of options per question">
            {OPTIONS_RANGE.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={field.value === n}
                onClick={() => field.onChange(n)}
                className={[
                  // ≥40px touch target (mobile-first)
                  'h-10 w-10 cursor-pointer rounded-md border text-sm font-medium transition-colors',
                  field.value === n
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background text-foreground hover:bg-accent',
                ].join(' ')}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      />
    </div>
  )
}
