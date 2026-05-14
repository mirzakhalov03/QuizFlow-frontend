import type { QuestionOption } from '@/types/quiz'

type Props = {
  options: QuestionOption[]
  value: string | undefined
  onChange: (optionId: string) => void
}

export default function MultipleChoice({ options, value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => {
        const selected = value === option.id
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
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
            <span>{option.text}</span>
          </button>
        )
      })}
    </div>
  )
}
