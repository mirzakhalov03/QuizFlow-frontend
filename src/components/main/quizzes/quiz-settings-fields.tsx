import { useWatch, type Path, type UseFormReturn } from 'react-hook-form'
import { Settings2, Sparkles, ChevronLeft } from 'lucide-react'

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
