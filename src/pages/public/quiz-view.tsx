import { useParams } from 'react-router-dom'
import { useGet } from '@/hooks/useGet'
import { PUBLIC_QUIZ_BY_TOKEN } from '@/constants/api-endpoints'
import type { QuizWithQuestions } from '@/types/quiz'
import type { ApiResponse } from '@/types/api'
import Spinner from '@/components/ui/spinner'
import MarkdownText from '@/components/main/quiz-solving/markdown-text'

export default function PublicQuizView() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const { data, isLoading, error } = useGet<ApiResponse<QuizWithQuestions>>(
    PUBLIC_QUIZ_BY_TOKEN(shareToken || '')
  )

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-2xl font-bold">Quiz not found</h1>
        <p className="text-muted-foreground mt-2">
          The link might be invalid or the quiz is no longer public.
        </p>
      </div>
    )
  }

  const quiz = data.data

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-3xl font-bold md:text-4xl">{quiz.title}</h1>
        {quiz.userInstructions && (
          <p className="text-muted-foreground mt-4 leading-relaxed whitespace-pre-wrap">
            {quiz.userInstructions}
          </p>
        )}
      </div>

      <div className="space-y-16">
        {quiz.questions?.map((question, index) => (
          <div key={question.id} className="space-y-6">
            <div className="flex items-start text-xl leading-snug font-semibold">
              <span className="text-primary mr-3 shrink-0">Q{index + 1}.</span>
              <MarkdownText text={question.text} className="flex-1" />
            </div>

            <div className="grid gap-3 pl-0 md:pl-10">
              {question.options?.map((option) => (
                <div
                  key={option.id}
                  className="bg-card border-border rounded-xl border p-4 text-sm md:text-base"
                >
                  <MarkdownText text={option.text} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 border-t pt-12 text-center">
        <p className="text-muted-foreground text-sm">
          Powered by <span className="font-bold">QuizFlow</span>. Create your own quizzes from any
          source.
        </p>
      </div>
    </div>
  )
}
