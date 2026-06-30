import type { SolvableOption } from '@/types/quiz'
import MarkdownText from '../markdown-text'

type Props = {
  options: SolvableOption[]
  value: string | undefined
  onChange: (optionId: string) => void
}

export default function MultipleChoice({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = value === option.id
        return (
          <div
            key={option.id}
            role="button"
            tabIndex={0}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onChange(option.id)
              }
            }}
            className={`focus-visible:ring-primary flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors outline-none focus-visible:ring-2 ${
              selected
                ? 'border-primary bg-primary/10 font-medium'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selected ? 'border-primary' : 'border-muted-foreground/40'
              }`}
            >
              {selected && <div className="bg-primary h-2 w-2 rounded-full" />}
            </div>
            <MarkdownText text={option.text} className="min-w-0 flex-1" as="div" />
          </div>
        )
      })}
    </div>
  )
}
