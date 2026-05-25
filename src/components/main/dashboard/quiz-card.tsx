import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Clock, Play, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useDelete } from '@/hooks/useDelete'
import { QUIZ_BY_ID, QUIZ_LIST } from '@/constants/api-endpoints'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import type { Quiz } from '@/types/quiz'
import { TYPE_COLORS, TYPE_LABELS } from '@/components/main/quizzes/utils'
import { PATHS } from '@/lib/path'

dayjs.extend(relativeTime)

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
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{quiz.title}</h3>
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
        {
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[quiz.type ?? 'mixed']}`}
          >
            {TYPE_LABELS[quiz.type ?? 'mixed']}
          </span>
        }
        {quiz.isTimerEnabled && quiz.timerDuration && (
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {Math.round(quiz.timerDuration / 60)} min
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <p className="text-muted-foreground text-xs">{dayjs(quiz.createdAt).fromNow()}</p>
        <Link to={PATHS.app.quiz(quiz.id)} onClick={(e) => e.stopPropagation()}>
          <button className="text-primary hover:bg-primary/10 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors">
            <Play className="h-3 w-3" />
            Start
          </button>
        </Link>
      </div>
    </div>
  )
}
