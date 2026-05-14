import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'

type Props = {
  quizTitle: string
}

export default function QuizSubmitted({ quizTitle }: Props) {
  return (
    <div className="border-border mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border p-8 text-center">
      <CheckCircle className="text-primary h-12 w-12" />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">Quiz complete!</h2>
        <p className="text-muted-foreground text-sm">{quizTitle}</p>
      </div>
      <Link to={PATHS.app.quizzes}>
        <Button variant="outline">Back to quizzes</Button>
      </Link>
    </div>
  )
}
