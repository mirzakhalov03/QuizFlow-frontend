import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import QuizIntro from '@/components/main/quiz-solving/quiz-intro'
import { useQuizSolving } from './context'

export default function QuizIntroView() {
  const { quiz } = useQuizSolving()
  const navigate = useNavigate()

  const start = () => {
    const first = quiz.questions[0]
    if (first) navigate(PATHS.app.quizQuestion(quiz.id, first.id))
  }

  return (
    <div className="space-y-6">
      <Link to={PATHS.app.quizzes}>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to quizzes
        </Button>
      </Link>
      <QuizIntro quiz={quiz} onStart={start} />
    </div>
  )
}
