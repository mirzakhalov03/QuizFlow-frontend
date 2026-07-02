import { Plus } from 'lucide-react'

import Modal from '@/components/custom/modal'
import QuizCard from '@/components/main/quizzes/quiz-card'
import QuizHeader from '@/components/main/quizzes/header'
import QuizFormWrapper from '@/components/main/quizzes/quiz-form-wrapper'
import { PendingQuizCard } from '@/components/main/quizzes/pending-quiz-card'
import { QuizToolbar } from '@/components/main/quizzes/quiz-toolbar'
import Button from '@/components/ui/button'
import Spinner from '@/components/ui/spinner'
import { useModal } from '@/hooks/useModal'
import { useQuizListControls } from '@/hooks/useQuizListControls'
import { cn } from '@/lib/utils'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'

export default function Quizzes() {
  const { openModal } = useModal('quiz-add')
  const pendingJobs = usePendingJobsStore((s) => s.jobs)

  const {
    items,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    isError,
    isFiltering,
    search,
    setSearch,
    sort,
    setSort,
    filterTypes,
    toggleFilterType,
    statusFilter,
    toggleStatusFilter,
    observerRef,
  } = useQuizListControls()

  return (
    <div className="space-y-4">
      <QuizHeader />

      <QuizToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        filterTypes={filterTypes}
        onToggleFilter={toggleFilterType}
        statusFilter={statusFilter}
        onToggleStatus={toggleStatusFilter}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div
          className={cn(
            'grid grid-cols-1 items-stretch gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            isFetching && !isFetchingNextPage && 'opacity-60'
          )}
        >
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

          {items.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}

          {hasNextPage && (
            <div ref={observerRef} className="col-span-full flex justify-center py-8">
              {isFetchingNextPage ? <Spinner size="md" /> : <div className="h-2 w-2" />}
            </div>
          )}

          {isError && items.length === 0 && (
            <p className="text-destructive col-span-full py-10 text-center text-sm">
              Couldn&apos;t load quizzes. Please try again.
            </p>
          )}

          {!isError && isFiltering && items.length === 0 && (
            <p className="text-muted-foreground col-span-full py-10 text-center text-sm">
              No quizzes match your search or filters.
            </p>
          )}
        </div>
      )}

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Create New Quiz" className="pb-0 sm:pb-0">
        <QuizFormWrapper />
      </Modal>
    </div>
  )
}
