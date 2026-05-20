import Button from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { Plus } from 'lucide-react'

export default function QuizHeader() {
  const { openModal } = useModal('quiz-add')

  return (
    <div className="flex items-center justify-between">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Quizzes</h1>
        <p className="text-muted-foreground text-sm">Manage your quizzes here.</p>
      </header>

      <Button onClick={openModal}>
        <Plus />
        Add
      </Button>
    </div>
  )
}
