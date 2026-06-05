import { Plus } from 'lucide-react'

import Modal from '@/components/custom/modal'
import DashboardHeader from '@/components/main/dashboard/dashboard-header'
import QuizCard from '@/components/main/dashboard/quiz-card'
import { PendingQuizCard } from '@/components/main/quizzes/pending-quiz-card'
import QuizFormWrapper from '@/components/main/quizzes/quiz-form-wrapper'
import { QuizToolbar } from '@/components/main/quizzes/quiz-toolbar'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { useModal } from '@/hooks/useModal'
import { useQuizListControls } from '@/hooks/useQuizListControls'
import { cn } from '@/lib/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import type { PaginatedResponse, Quiz } from '@/types/quiz'

export default function Dashboard() {
  const { openModal } = useModal('quiz-add')
  const pendingJobs = usePendingJobsStore((s) => s.jobs)

  const { data, isLoading } = useGet<PaginatedResponse<Quiz>>(QUIZ_LIST, {
    options: { staleTime: 0 },
  })

  const { processed, sort, setSort, filterTypes, toggleFilterType } = useQuizListControls(
    data?.data?.items ?? []
  )
  const total = data?.data?.pagination?.count ?? 0

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Quizzes" value={String(total)} />
        <Stat label="Responses" value="0" />
        <Stat label="Avg. score" value="—" />
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold sm:text-2xl">Quizzes</h2>

        <QuizToolbar
          sort={sort}
          onSortChange={setSort}
          filterTypes={filterTypes}
          onToggleFilter={toggleFilterType}
        />

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            {pendingJobs.map((job) => (
              <PendingQuizCard key={job.jobId} {...job} />
            ))}

            {processed.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Add new quiz" className="pb-0 sm:pb-0">
        <QuizFormWrapper />
      </Modal>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-xl font-semibold sm:text-2xl">{value}</div>
    </div>
  )
}
