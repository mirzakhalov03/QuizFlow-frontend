import Modal from '@/components/custom/modal'
import QuizCard from '@/components/main/dashboard/quiz-card'
import QuizHeader from '@/components/main/quizzes/header'
import QuizForm from '@/components/main/quizzes/quiz-form'
import Spinner from '@/components/ui/spinner'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { useGet } from '@/hooks/useGet'
import { useModal } from '@/hooks/useModal'
import type { PaginatedResponse, Quiz } from '@/types/quiz'

export default function Quizzes() {
  const { openModal } = useModal('quiz-add')

  const { data, isLoading } = useGet<PaginatedResponse<Quiz>>(QUIZ_LIST, {
    options: { staleTime: 0 },
  })

  const quizzes = data?.data?.items ?? []

  return (
    <div className="space-y-6">
      <QuizHeader onNew={openModal} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border p-6 text-sm">
          No quizzes yet. Create your first one!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Add new quiz">
        <QuizForm />
      </Modal>
    </div>
  )
}
