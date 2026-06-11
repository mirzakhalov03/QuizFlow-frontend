import { useState, type KeyboardEvent } from 'react'
import { Check, Clock, Hash, Pencil, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { usePatch } from '@/hooks/usePatch'
import { QUIZ_BY_ID, QUIZ_LIST } from '@/constants/api-endpoints'
import { toast } from '@/lib/toast'
import type { QuizWithQuestions } from '@/types/quiz'
import MarkdownText from './markdown-text'

type Props = {
  quiz: QuizWithQuestions
  onStart: () => void
}

const MAX_TITLE_LENGTH = 200

export default function QuizIntro({ quiz, onStart }: Props) {
  const durationMinutes = quiz.timerDuration ? Math.round(quiz.timerDuration / 60) : null

  const queryClient = useQueryClient()
  const { mutate: rename, isPending } = usePatch<{ title: string }>()

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(quiz.title)

  const startEditing = () => {
    setDraft(quiz.title)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setDraft(quiz.title)
  }

  const saveTitle = () => {
    const next = draft.trim()
    if (!next) {
      toast.error('Title cannot be empty.')
      return
    }
    if (next === quiz.title) {
      setIsEditing(false)
      return
    }
    rename(
      QUIZ_BY_ID(quiz.id),
      { title: next },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QUIZ_BY_ID(quiz.id)] })
          queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
          setIsEditing(false)
          toast.success('Quiz renamed.')
        },
      }
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveTitle()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  return (
    <div className="border-border mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border p-8">
      <div className="flex flex-col gap-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={MAX_TITLE_LENGTH}
              disabled={isPending}
              aria-label="Quiz title"
              className="border-border focus-visible:ring-primary/40 w-full rounded-lg border bg-transparent px-3 py-1.5 text-2xl font-bold outline-none focus-visible:ring-2 disabled:opacity-60"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={saveTitle}
              loading={isPending}
              aria-label="Save title"
            >
              {!isPending && <Check className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={cancelEditing}
              disabled={isPending}
              aria-label="Cancel rename"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="group flex items-center gap-2">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <button
              type="button"
              onClick={startEditing}
              aria-label="Rename quiz"
              className="text-muted-foreground hover:text-foreground shrink-0 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
        {quiz.userInstructions && (
          <MarkdownText
            text={quiz.userInstructions}
            className="text-muted-foreground text-sm leading-relaxed"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
          <Hash className="h-3 w-3" />
          {quiz.questions.length} questions
        </span>
        {quiz.isTimerEnabled && durationMinutes && (
          <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
            <Clock className="h-3 w-3" />
            {durationMinutes} min
          </span>
        )}
      </div>

      <Button onClick={onStart} className="self-start">
        Start Quiz
      </Button>
    </div>
  )
}
