import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import QuestionCard from '@/components/main/quiz-solving/question-card'
import QuizProgress from '@/components/main/quiz-solving/quiz-progress'
import { hasUngradableQuestions } from '@/lib/quiz-submit'
import { useQuizSolving } from './context'

export default function QuizQuestionView() {
  const { quiz, answers, onAnswerChange, submit, isSubmitting } = useQuizSolving()
  const { questionId } = useParams<{ questionId: string }>()
  const navigate = useNavigate()

  if (quiz.questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">This quiz has no questions.</p>
      </div>
    )
  }

  const index = quiz.questions.findIndex((q) => q.id === questionId)
  if (index === -1) {
    return <Navigate to={PATHS.app.quizQuestion(quiz.id, quiz.questions[0].id)} replace />
  }

  const currentQuestion = quiz.questions[index]
  const isLast = index === quiz.questions.length - 1
  const containsMultiSelect = hasUngradableQuestions(quiz.questions)

  const goTo = (i: number) => {
    const target = quiz.questions[i]
    if (target) navigate(PATHS.app.quizQuestion(quiz.id, target.id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="lg:hidden">
        <QuizProgress
          questions={quiz.questions}
          answers={answers}
          activeIndex={index}
          onSelect={goTo}
        />
      </div>

      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        index={index}
        value={answers[currentQuestion.id]}
        onChange={(value) => onAnswerChange(currentQuestion.id, value)}
      />

      <div className="flex items-center justify-between gap-4 pb-8">
        <Button variant="outline" onClick={() => goTo(index - 1)} disabled={index === 0}>
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {isLast ? (
            <Button onClick={submit} disabled={containsMultiSelect || isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={() => goTo(index + 1)}>Next</Button>
          )}
        </div>
      </div>

      {containsMultiSelect && isLast && (
        <p className="text-muted-foreground -mt-4 text-center text-sm">
          Multi-select quizzes aren’t gradable yet — submission is disabled.
        </p>
      )}
    </div>
  )
}
