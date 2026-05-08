/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardHeader from '@/components/main/dashboard/dashboard-header'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useModal } from '@/hooks/useModal'
import Modal from '@/components/custom/modal'
import QuizForm from '@/components/main/quizzes/quiz-form'

export default function Dashboard() {
  const { openModal } = useModal('quiz-add')

  const handleNewModal = () => {
    openModal()
  }
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Quizzes" value="0" />
        <Stat label="Responses" value="0" />
        <Stat label="Avg. score" value="—" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold sm:text-2xl">Quizzes</h1>
        <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* {data?.data?.map((quiz: any) => {
          return <QuizCard key={quiz.id} />
        })} */}
          <Button
            onClick={handleNewModal}
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
            <span className="text-xs font-medium">New Quizz</span>
          </Button>
        </div>
      </div>

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Add new quiz">
        <QuizForm />
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
