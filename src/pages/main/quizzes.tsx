import { Plus } from 'lucide-react'

import Modal from '@/components/custom/modal'
import QuizCard from '@/components/main/dashboard/quiz-card'
import QuizHeader from '@/components/main/quizzes/header'
import QuizFormWrapper from '@/components/main/quizzes/quiz-form-wrapper'
import { PendingQuizCard } from '@/components/main/quizzes/pending-quiz-card'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { useModal } from '@/hooks/useModal'
import { cn } from '@/lib/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import type { PaginatedResponse, Quiz } from '@/types/quiz'

export default function Quizzes() {
  const { openModal } = useModal('quiz-add')
  const pendingJobs = usePendingJobsStore((s) => s.jobs)

  const { data, isLoading } = useGet<PaginatedResponse<Quiz>>(QUIZ_LIST, {
    options: { staleTime: 0 },
  })

  const quizzes = [...(data?.data?.items ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <QuizHeader />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pendingJobs.map((job) => (
            <PendingQuizCard key={job.jobId} {...job} />
          ))}
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
          <Button
            onClick={openModal}
            className={cn(
              'group border-border/50 bg-card/50 h-full rounded-xl border-2 border-dashed',
              'flex min-h-30 flex-col items-center justify-center gap-2 p-5',
              'border-primary/40 hover:bg-primary/5 text-primary',
              'cursor-pointer transition-all duration-200'
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-current">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">New Quiz</span>
          </Button>
        </div>
      )}

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Create New Quiz">
        <QuizFormWrapper />
      </Modal>
    </div>
  )
}
