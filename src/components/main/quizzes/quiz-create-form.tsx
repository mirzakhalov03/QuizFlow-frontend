import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

import { quizService } from '@/api/services/quiz.service'
import Button from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { toast } from '@/lib/toast'
import { extractApiErrorMessage } from '@/lib/api-error'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import { formDefaults, toTimerSeconds, type QuizFormValues } from '@/components/main/quizzes/utils'
import SourceStep from '@/components/main/quizzes/source-step'
import EssentialFields from '@/components/main/quizzes/essential-fields'
import AdvancedSettings from '@/components/main/quizzes/advanced-settings'

export default function QuizCreateForm({ folderId }: { folderId?: string }) {
  const { closeModal } = useModal('quiz-add')
  const addJob = usePendingJobsStore((s) => s.addJob)
  const setJobReady = usePendingJobsStore((s) => s.setJobReady)
  const markJobFailed = usePendingJobsStore((s) => s.markJobFailed)

  const [view, setView] = useState<'source' | 'params'>('source')
  const form = useForm<QuizFormValues>({ defaultValues: formDefaults(folderId) })
  const { handleSubmit, reset, trigger, getValues, formState } = form

  const goToParams = async () => {
    const field = getValues('source') === 'file' ? 'files' : 'pageIds'
    if (await trigger(field)) setView('params')
  }

  const onSubmit = (values: QuizFormValues) => {
    // Enter-key safety: on Screen 1, submit means "advance", not "generate".
    if (view === 'source') {
      void goToParams()
      return
    }

    const tempId = crypto.randomUUID()
    const targetFolderId = values.folderId !== 'none' ? values.folderId : undefined

    const truncate = (name: string, max = 25) =>
      name.length > max ? name.slice(0, max - 3) + '...' : name
    const tempTitle =
      values.source === 'notion'
        ? `Notion Quiz (${values.pageIds.length} page${values.pageIds.length > 1 ? 's' : ''})`
        : values.files.length === 1
          ? `Quiz from ${truncate(values.files[0].name)}`
          : `Quiz from ${truncate(values.files[0].name)} and ${values.files.length - 1} more file${values.files.length > 2 ? 's' : ''}`

    const shared = {
      type: values.type,
      questionCount: parseInt(values.questionCount, 10),
      optionsPerQuestion: values.optionsPerQuestion,
      userInstructions: values.userInstructions || undefined,
      difficulty: values.difficulty,
      isTimerEnabled: values.isTimerEnabled,
      timerDuration: toTimerSeconds(values.isTimerEnabled, values.timerDuration),
      model: values.model,
      apiKeyId: values.apiKeyId || undefined,
      folderId: targetFolderId,
      avoidQuizIds: values.avoidQuizIds?.length ? values.avoidQuizIds : undefined,
    }

    closeModal()
    reset()
    setView('source')
    addJob({ jobId: tempId, title: tempTitle, type: values.type, folderId: targetFolderId })
    ;(async () => {
      try {
        let result
        if (values.source === 'notion') {
          result = await quizService.createQuiz('notion', { pageIds: values.pageIds, ...shared })
        } else {
          const keys = await Promise.all(
            values.files.map(async (file) => {
              const { uploadUrl, key } = await quizService.getPresignedUrl(file)
              await quizService.uploadToS3(uploadUrl, file)
              return key
            })
          )
          result = await quizService.createQuiz('file', { keys, ...shared })
        }
        setJobReady(tempId, result.jobId)
      } catch (err: unknown) {
        const message = extractApiErrorMessage(err)
        markJobFailed(tempId, message)
        toast.error(message)
      }
    })()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Orientation line — plain text, not a clickable stepper. */}
      <p className="text-muted-foreground text-xs font-medium">
        Step {view === 'source' ? 1 : 2} of 2 ·{' '}
        <span className="text-foreground">
          {view === 'source' ? 'Choose a source' : 'Quiz settings'}
        </span>
      </p>

      {view === 'source' ? (
        <SourceStep form={form} />
      ) : (
        <div className="space-y-6">
          <EssentialFields form={form} />
          <AdvancedSettings form={form} folderId={folderId} />
        </div>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 flex gap-3 border-t border-gray-200 bg-white px-4 pt-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-6 dark:border-gray-700 dark:bg-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={view === 'source' ? closeModal : () => setView('source')}
          leftIcon={<ChevronLeft size={16} />}
          className="flex-1"
        >
          {view === 'source' ? 'Cancel' : 'Back'}
        </Button>
        {view === 'source' ? (
          <Button type="button" onClick={goToParams} className="flex-1" rightIcon={<ChevronRight size={16} />}>
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            className="flex-1"
            rightIcon={<Sparkles className="h-4 w-4" />}
            disabled={formState.isSubmitting}
          >
            Generate Quiz
          </Button>
        )}
      </div>
    </form>
  )
}
