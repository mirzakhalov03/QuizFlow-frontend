import { useState, useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'

import { FormSelect } from '@/components/form/form-select'
import FormTextarea from '@/components/form/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useQuizFormOptions } from '@/hooks/useQuizFormOptions'
import { useGet } from '@/hooks/useGet'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import type { PaginatedResponse } from '@/types/api'
import type { Quiz } from '@/types/quiz'
import { aiModels, type QuizFormValues } from '@/components/main/quizzes/utils'

type Props = { form: UseFormReturn<QuizFormValues>; folderId?: string }

/** Screen 2 — collapsed by default; all fields inside are defaulted. */
export default function AdvancedSettings({ form, folderId }: Props) {
  const [open, setOpen] = useState(false)
  const { control } = form
  const { byokKeys, folderOptions, byokOptions } = useQuizFormOptions(form)

  const { data: quizzesData } = useGet<PaginatedResponse<Quiz>>(QUIZ_LIST, { params: { limit: 500 } })
  const quizzes = useMemo(
    () => [...(quizzesData?.data?.items || [])].sort((a, b) => a.title.localeCompare(b.title)),
    [quizzesData?.data?.items]
  )

  return (
    <div className="border-border/50 rounded-xl border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
      >
        <span className="text-muted-foreground flex items-center gap-2">
          <SlidersHorizontal className="text-primary h-4 w-4" />
          Advanced settings
        </span>
        <ChevronDown className={['h-4 w-4 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
      </button>

      {open && (
        <div className="space-y-4 px-4 pt-1 pb-4">
          <FormSelect label="Save to Folder" options={folderOptions} name="folderId" control={control} disabled={!!folderId} />

          <FormSelect label="AI Model" options={aiModels} name="model" control={control} required groupKey="provider" />

          {byokKeys.length > 0 && (
            <FormSelect label="Use Your Own Key (BYOK)" options={byokOptions} name="apiKeyId" control={control} />
          )}

          <FormTextarea
            label="Custom Instructions"
            methods={form}
            name="userInstructions"
            placeholder="Focus on specific topics, question styles, etc. (optional)"
          />

          {quizzes.length > 0 && (
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Avoid Repeating Questions</label>
              <Controller
                name="avoidQuizIds"
                control={control}
                render={({ field }) => {
                  const selectedIds = new Set<string>((field.value as string[]) || [])
                  const toggle = (id: string) => {
                    const next = new Set(selectedIds)
                    if (next.has(id)) next.delete(id)
                    else next.add(id)
                    field.onChange(Array.from(next))
                  }
                  return (
                    <div className="border-border bg-background max-h-36 space-y-1 overflow-y-auto rounded-lg border p-1">
                      {quizzes.map((quiz) => (
                        <label
                          key={quiz.id}
                          className="hover:bg-muted/50 flex cursor-pointer items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-colors"
                        >
                          <Checkbox
                            checked={selectedIds.has(quiz.id)}
                            onCheckedChange={() => toggle(quiz.id)}
                            id={`avoid-${quiz.id}`}
                          />
                          <span className="truncate font-medium">{quiz.title}</span>
                        </label>
                      ))}
                    </div>
                  )
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
