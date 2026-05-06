import Modal from '@/components/custom/modal'
import QuizForm from '@/components/main/quizzes/quiz-form'
import Button from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
 
import { Plus } from 'lucide-react'

export default function QuizHeader() {
  const { openModal } = useModal('quiz-add')

  const handleAddNewQuiz = () => {
    openModal()
  }

 

  

  return (
    <div className="flex items-center justify-between">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Quizzes</h1>
        <p className="text-muted-foreground text-sm">Manage your quizzes here.</p>
      </header>

      <Button onClick={handleAddNewQuiz}>
        <Plus />
        Add
      </Button>
           <Button onClick={handleAddNewQuiz}>
        <Plus />
        Add
      </Button>

      <Modal size='max-w-4xl' modalKey="quiz-add" title="Add new quiz" >
        <QuizForm />
      </Modal>
    </div>
  )
}
