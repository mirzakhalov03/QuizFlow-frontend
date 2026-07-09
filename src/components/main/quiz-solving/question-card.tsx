import type { SolvableQuestion } from '@/types/quiz'
import { Bookmark } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import MultipleChoice from './question-types/multiple-choice'
import MultiSelect from './question-types/multi-select'
import TrueFalse from './question-types/true-false'
import OpenEnded from './question-types/open-ended'
import MarkdownText from './markdown-text'

type Props = {
  question: SolvableQuestion
  index: number
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
}

export default function QuestionCard({ question, index, value, onChange }: Props) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(question.id)

  return (
    <div
      id={`question-${index}`}
      className="bg-card border-border flex scroll-mt-16 flex-col gap-4 rounded-xl border p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="bg-muted text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
            {index + 1}
          </span>
          <MarkdownText
            text={question.text}
            className="min-w-0 flex-1 pt-0.5 text-sm leading-relaxed font-bold"
          />
        </div>
        <button
          type="button"
          onClick={() => toggleBookmark(question.id)}
          className="text-muted-foreground hover:text-primary hover:bg-muted/50 cursor-pointer shrink-0 rounded-md p-1 transition-colors"
          title={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
        >
          <Bookmark className={`h-4.5 w-4.5 ${bookmarked ? 'fill-primary text-primary' : ''}`} />
        </button>
      </div>

      <div className="pl-9">
        {question.type === 'multiple_choice' && (
          <MultipleChoice
            options={question.options}
            value={value as string | undefined}
            onChange={onChange as (v: string) => void}
          />
        )}
        {question.type === 'multi_select' && (
          <MultiSelect
            options={question.options}
            value={(value as string[]) ?? []}
            onChange={onChange as (v: string[]) => void}
          />
        )}
        {question.type === 'true_false' && (
          <TrueFalse
            options={question.options}
            value={value as string | undefined}
            onChange={onChange as (v: string) => void}
          />
        )}
        {question.type === 'open_ended' && (
          <OpenEnded value={(value as string) ?? ''} onChange={onChange as (v: string) => void} />
        )}
      </div>
    </div>
  )
}
