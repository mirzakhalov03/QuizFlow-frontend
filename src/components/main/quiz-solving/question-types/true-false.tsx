import type { SolvableOption } from '@/types/quiz'
import MarkdownText from '../markdown-text'

type Props = {
  options: SolvableOption[]
  value: string | undefined
  onChange: (optionId: string) => void
}

export default function TrueFalse({ options, value, onChange }: Props) {
  return (
    <div className="flex gap-3">
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
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selected
                ? 'border-primary bg-primary/10 text-primary'
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
            <MarkdownText text={option.text} as="div" />
          </div>
        )
      })}
    </div>
  )
}
