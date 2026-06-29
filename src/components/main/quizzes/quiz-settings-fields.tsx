import { Controller, useWatch, type Path, type UseFormReturn } from 'react-hook-form'
import { Settings2, Sparkles, ChevronLeft, FileQuestion } from 'lucide-react'

import { FormSelect } from '@/components/form/form-select'
import { FormCheckbox } from '@/components/form/form-checkbox'
import FormInput from '@/components/form/input'
import FormTextarea from '@/components/form/textarea'
import Button from '@/components/ui/button'
import { useQuizFormOptions } from '@/hooks/useQuizFormOptions'
import {
  aiModels,
  difficulties,
  questionCounts,
  questionTypes,
  type QuizSettingsValues,
} from '@/components/main/quizzes/utils'
import { useGet } from '@/hooks/useGet'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Quiz } from '@/types/quiz'
import { Checkbox } from '@/components/ui/checkbox'

type QuizSettingsFieldsProps<T extends QuizSettingsValues> = {
  form: UseFormReturn<T>
  onBack: () => void
  /** When set (e.g. creating inside a folder), the folder is fixed and the select is disabled. */
  folderId?: string
}

/**
 * The "Quiz Settings" block shared by the file-upload and Notion quiz forms:
 * folder/type/count/difficulty/model/BYOK selects, the optional timer field,
 * custom instructions, and the back/generate footer. The source-specific fields
 * (file upload or Notion page picker) are rendered by each form above this.
 */
export default function QuizSettingsFields<T extends QuizSettingsValues>({
  form,
  onBack,
  folderId,
}: QuizSettingsFieldsProps<T>) {
  const { control } = form
  const { byokKeys, folderOptions, byokOptions } = useQuizFormOptions(form)
  const timerEnabled = useWatch({ control, name: 'isTimerEnabled' as Path<T> }) ?? false

  const { data: quizzesData } = useGet<ApiResponse<PaginatedResponse<Quiz>>>(QUIZ_LIST, {
    params: { limit: 500 },
  })
  const quizzes = quizzesData?.data?.items || []

  return (
    <>
      <div className="bg-muted/40 space-y-3 rounded-xl p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <Settings2 className="h-3.5 w-3.5" />
          Quiz Settings
        </p>

        <FormSelect
          label="Save to Folder"
          options={folderOptions}
          name={'folderId' as Path<T>}
          control={control}
          disabled={!!folderId}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormSelect
            label="Question Type"
            options={questionTypes}
            name={'type' as Path<T>}
            control={control}
            required
          />
          <FormSelect
            label="Question Count"
            options={questionCounts}
            name={'questionCount' as Path<T>}
            control={control}
            required
          />
        </div>

        <OptionsPerQuestionField form={form} /> 

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormSelect
            label="Difficulty"
            options={difficulties}
            name={'difficulty' as Path<T>}
            control={control}
            required
          />
          <FormSelect
            label="AI Model"
            options={aiModels}
            name={'model' as Path<T>}
            control={control}
            required
            groupKey="provider"
          />
        </div>

        {byokKeys.length > 0 && (
          <FormSelect
            label="Use Your Own Key (BYOK)"
            options={byokOptions}
            name={'apiKeyId' as Path<T>}
            control={control}
          />
        )}

        <FormCheckbox label="Enable Timer" control={control} name={'isTimerEnabled' as Path<T>} />

        {timerEnabled && (
          <FormInput
            name={'timerDuration' as Path<T>}
            methods={form}
            label="Timer (minutes)"
            type="number"
            min={1}
            onKeyDown={(e) => {
              if (['-', 'e', 'E', '+'].includes(e.key)) {
                e.preventDefault()
              }
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

      {quizzes.length > 0 && (
        <div className="bg-muted/40 space-y-3 rounded-xl p-3">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
            <FileQuestion className="h-3.5 w-3.5" />
            Avoid Repeating Questions
          </p>
          <p className="text-muted-foreground text-xs">
            Select quizzes whose questions you want to avoid repeating in the new quiz.
          </p>
          <Controller
            name={'avoidQuizIds' as Path<T>}
            control={control}
            render={({ field }) => {
              const selectedIds = new Set(field.value || [])
              const handleToggle = (id: string) => {
                const newSelected = new Set(selectedIds)
                if (newSelected.has(id)) {
                  newSelected.delete(id)
                } else {
                  newSelected.add(id)
                }
                field.onChange(Array.from(newSelected))
              }

              return (
                <div className="border-border bg-background max-h-36 space-y-1 overflow-y-auto rounded-lg border p-1">
                  {quizzes.map((quiz) => {
                    const isChecked = selectedIds.has(quiz.id)
                    return (
                      <label
                        key={quiz.id}
                        className="hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggle(quiz.id)}
                          id={`avoid-${quiz.id}`}
                        />
                        <span className="truncate font-medium">{quiz.title}</span>
                      </label>
                    )
                  })}
                </div>
              )
            }}
          />
        </div>
      )}

      <FormTextarea
        label="Custom Instructions"
        methods={form}
        name={'userInstructions' as Path<T>}
        placeholder="e.g. Focus on chapter 3, only ask about dates… (optional)"
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex gap-2 border-t border-gray-200 bg-white px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-6 dark:border-gray-700 dark:bg-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<ChevronLeft size={16} />}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" className="flex-1" rightIcon={<Sparkles className="h-4 w-4" />}>
          Generate Quiz
        </Button>
      </div>
    </>
  )
}


const OPTIONS_RANGE = [2, 3, 4, 5, 6] as const
const OPTION_BASED_TYPES: QuizSettingsValues['type'][] = ['multiple_choice', 'multi_select']

function OptionsPerQuestionField<T extends QuizSettingsValues>({ form }: { form: UseFormReturn<T> }) {
  const selectedType = useWatch({ control: form.control, name: 'type' as Path<T> }) as string

  if (!OPTION_BASED_TYPES.includes(selectedType as QuizSettingsValues['type'])) return null

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        Options per question
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          (Multiple choice &amp; Multi-select)
        </span>
      </label>
      <Controller
        name={'optionsPerQuestion' as Path<T>}
        control={form.control}
        defaultValue={4 as never}
        render={({ field }) => (
          <div className="flex gap-2" role="group" aria-label="Number of options per question">
            {OPTIONS_RANGE.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={field.value === n}
                onClick={() => field.onChange(n)}
                className={[
                  'h-9 w-9 rounded-md border text-sm font-medium transition-colors',
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
      <p className="text-xs text-muted-foreground">
        Each eligible question will have exactly this many answer choices.
      </p>
    </div>
  )
}