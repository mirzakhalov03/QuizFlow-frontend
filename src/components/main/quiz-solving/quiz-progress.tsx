import type { SolvableQuestion } from '@/types/quiz'

type Props = {
  questions: SolvableQuestion[]
  answers: Record<string, string | string[]>
  activeIndex: number
  onSelect: (index: number) => void
}

function isAnswered(value: string | string[] | undefined): boolean {
  if (value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  return value.trim().length > 0
}

export default function QuizProgress({ questions, answers, activeIndex, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, i) => {
        const answered = isAnswered(answers[q.id])
        const active = i === activeIndex
        return (
          <button
            key={q.id}
            onClick={() => onSelect(i)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              active ? 'border-primary border-2' : ''
            } ${
              answered
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
