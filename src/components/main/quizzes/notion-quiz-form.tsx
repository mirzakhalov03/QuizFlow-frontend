import { useEffect, useMemo, useRef } from 'react'
import { useForm, useController, useWatch } from 'react-hook-form'
import { Settings2, Sparkles, ChevronLeft, X } from 'lucide-react'

import { useGet } from '@/hooks/useGet'
import { ApiResponse } from '@/types/api'
import { Folder } from '@/types/folder'
import { quizService } from '@/api/services/quiz.service'
import { FormSelect } from '@/components/form/form-select'
import FieldLabel from '@/components/form/form-label'
import FormTextarea from '@/components/form/textarea'
import FormInput from '@/components/form/input'
import { FormCheckbox } from '@/components/form/form-checkbox'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { toast } from '@/lib/toast'
import type { QuestionType } from '@/types/quiz'
import {
  aiModels,
  DEFAULT_MODEL,
  difficulties,
  questionCounts,
  questionTypes,
} from '@/components/main/quizzes/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import { useModal } from '@/hooks/useModal'
import { useNotionPages } from '@/hooks/useNotionPages'
import { useByokKeys } from '@/hooks/useByokKeys'

type NotionFormValues = {
  pageIds: string[]
  type: QuestionType
  questionCount: string
  difficulty: string
  model: string
  apiKeyId: string
  isTimerEnabled: boolean
  timerDuration?: number
  userInstructions?: string
  folderId: string
}

type NotionQuizFormProps = {
  onBack: () => void
  folderId?: string
}

export default function NotionQuizForm({ onBack, folderId }: NotionQuizFormProps) {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const { pages, loading, error, refetch } = useNotionPages()
  const { keys: byokKeys } = useByokKeys()

  const { data: foldersData } = useGet<ApiResponse<Folder[]>>('/folders')
  const folderOptions = useMemo(() => {
    const folders = foldersData?.data || []
    return [
      { label: 'No Folder', value: 'none' },
      ...folders.map((f) => ({ label: f.name, value: f.id })),
    ]
  }, [foldersData?.data])

  const form = useForm<NotionFormValues>({
    defaultValues: {
      pageIds: [],
      type: 'multiple_choice',
      questionCount: '5',
      difficulty: 'medium',
      model: DEFAULT_MODEL,
      apiKeyId: '',
      isTimerEnabled: false,
      userInstructions: '',
      folderId: folderId || 'none',
    },
  })

  const { handleSubmit, reset, control, setValue, getValues } = form
  const { field: pageIdsField, fieldState } = useController({
    control,
    name: 'pageIds',
    rules: { validate: (v) => v.length > 0 || 'Select at least one page' },
  })

  const timerEnabled = useWatch({ control, name: 'isTimerEnabled' }) ?? false

  const byokOptions = useMemo(() => {
    return [
      { label: 'None (Use QuizFlow credits)', value: '' },
      ...byokKeys.map((key) => ({
        label: `${key.keyName} (${key.provider})`,
        value: key.id,
      })),
    ]
  }, [byokKeys])

  const byokDefaultApplied = useRef(false)
  useEffect(() => {
    if (!byokDefaultApplied.current && byokKeys.length > 0) {
      if (!getValues('apiKeyId')) {
        setValue('apiKeyId', byokKeys[0].id)
      }
      byokDefaultApplied.current = true
    }
  }, [byokKeys, setValue, getValues])

  const onSubmit = (values: NotionFormValues) => {
    const tempId = crypto.randomUUID()
    const targetFolderId = values.folderId !== 'none' ? values.folderId : undefined

    closeModal()
    reset()
    addJob({
      jobId: tempId,
      title: 'Generating quiz…',
      type: values.type,
      folderId: targetFolderId,
    })
    ;(async () => {
      try {
        const result = await quizService.createQuiz('notion', {
          pageIds: values.pageIds,
          type: values.type === 'mixed' ? undefined : values.type,
          questionCount: parseInt(values.questionCount, 10),
          userInstructions: values.userInstructions || undefined,
          folderId: values.folderId !== 'none' ? values.folderId : undefined,
          difficulty: values.difficulty,
          isTimerEnabled: values.isTimerEnabled,
          timerDuration:
            values.isTimerEnabled && values.timerDuration ? values.timerDuration * 60 : undefined,
          model: values.model,
          apiKeyId: values.apiKeyId || undefined,
        })

        setJobReady(tempId, result.jobId)
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string; detail?: string } } }
        const message =
          e?.response?.data?.message ??
          e?.response?.data?.detail ??
          (err instanceof Error ? err.message : 'Generation failed. Please try again.')
        markJobFailed(tempId, message)
        toast.error(message)
      }
    })()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 pb-4 sm:pb-6">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">{error}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} leftIcon={<ChevronLeft size={16} />}>
            Back
          </Button>
          <Button onClick={refetch} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const selectedIds: string[] = pageIdsField.value ?? []
  const unselectedPages = pages.filter((p) => !selectedIds.includes(p.id))
  const selectedPages = pages.filter((p) => selectedIds.includes(p.id))

  const removePage = (id: string) => {
    pageIdsField.onChange(selectedIds.filter((pid) => pid !== id))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <FieldLabel required isError={!!fieldState.error}>
          Add Notion Pages
        </FieldLabel>
        <select
          className="border-border bg-background focus:ring-primary/40 w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none disabled:opacity-50"
          value=""
          disabled={unselectedPages.length === 0}
          onChange={(e) => {
            const id = e.target.value
            if (id) pageIdsField.onChange([...selectedIds, id])
          }}
        >
          <option value="" disabled>
            {unselectedPages.length ? 'Choose a page…' : 'All pages selected'}
          </option>
          {unselectedPages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon ? `${p.icon} ${p.title}` : p.title}
            </option>
          ))}
        </select>
        {selectedPages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedPages.map((p) => (
              <span
                key={p.id}
                className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              >
                {p.icon && <span>{p.icon}</span>}
                {p.title}
                <button
                  type="button"
                  onClick={() => removePage(p.id)}
                  className="hover:text-primary/70 ml-0.5"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        {fieldState.error && <p className="text-destructive text-xs">{fieldState.error.message}</p>}
      </div>

      <div className="bg-muted/40 space-y-3 rounded-xl p-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
          <Settings2 className="h-3.5 w-3.5" />
          Quiz Settings
        </p>

        <FormSelect
          label="Save to Folder"
          options={folderOptions}
          name="folderId"
          control={control}
          disabled={!!folderId}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormSelect
            label="Question Type"
            options={questionTypes}
            name="type"
            control={control}
            required
          />
          <FormSelect
            label="Question Count"
            options={questionCounts}
            name="questionCount"
            control={control}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormSelect
            label="Difficulty"
            options={difficulties}
            name="difficulty"
            control={control}
            required
          />
          <FormSelect label="AI Model" options={aiModels} name="model" control={control} required />
        </div>

        {byokKeys.length > 0 && (
          <FormSelect
            label="Use Your Own Key (BYOK)"
            options={byokOptions}
            name="apiKeyId"
            control={control}
          />
        )}

        <FormCheckbox label="Enable Timer" control={control} name="isTimerEnabled" />

        {timerEnabled && (
          <FormInput
            name="timerDuration"
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
        name="userInstructions"
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
    </form>
  )
}
