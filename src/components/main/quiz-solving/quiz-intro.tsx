import { Clock, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QuizWithQuestions } from '@/types/quiz'
import MarkdownText from './markdown-text'

type Props = {
  quiz: QuizWithQuestions
  onStart: () => void
}

export default function QuizIntro({ quiz, onStart }: Props) {
  const durationMinutes = quiz.timerDuration ? Math.round(quiz.timerDuration / 60) : null

  return (
    <div className="border-border mx-auto flex max-w-2xl flex-col gap-6 rounded-xl border p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.userInstructions && (
          <MarkdownText
            text={quiz.userInstructions}
            className="text-muted-foreground text-sm leading-relaxed"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
          <Hash className="h-3 w-3" />
          {quiz.questions.length} questions
        </span>
        {quiz.isTimerEnabled && durationMinutes && (
          <span className="bg-muted text-muted-foreground flex items-center gap-1.5 rounded-full px-3 py-1 text-xs">
            <Clock className="h-3 w-3" />
            {durationMinutes} min
          </span>
        )}
      </div>

      <Button onClick={onStart} className="self-start">
        Start Quiz
      </Button>
    </div>
  )
}
