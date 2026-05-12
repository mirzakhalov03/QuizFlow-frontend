import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Clock, Trash2 } from 'lucide-react'

import { useDelete } from '@/hooks/useDelete'
import { QUIZ_BY_ID, QUIZ_LIST } from '@/constants/api-endpoints'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import type { Quiz, QuestionType } from '@/types/quiz'

dayjs.extend(relativeTime)

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  multi_select: 'Multi Select',
  true_false: 'True / False',
  open_ended: 'Open Ended',
}

const TYPE_COLORS: Record<QuestionType, string> = {
  multiple_choice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  multi_select: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  true_false: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  open_ended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
}

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const queryClient = useQueryClient()

  const { mutate: deleteQuiz, isPending } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
      toast.success('Quiz deleted')
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteQuiz(QUIZ_BY_ID(quiz.id))
  }

  return (
    <div className="bg-card border-border flex flex-col gap-3 rounded-xl border p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{quiz.title}</h3>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive mt-0.5 shrink-0 transition-colors disabled:opacity-40"
          aria-label="Delete quiz"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {quiz.type && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[quiz.type]}`}
          >
            {TYPE_LABELS[quiz.type]}
          </span>
        )}
        {quiz.isTimerEnabled && quiz.timerDuration && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {Math.round(quiz.timerDuration / 60)} min
          </span>
        )}
      </div>

      <p className="text-muted-foreground mt-auto text-xs">{dayjs(quiz.createdAt).fromNow()}</p>
    </div>
  )
}
