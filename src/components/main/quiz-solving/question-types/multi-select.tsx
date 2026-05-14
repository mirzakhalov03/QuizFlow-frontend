import { Checkbox } from '@/components/ui/checkbox'
import type { QuestionOption } from '@/types/quiz'

type Props = {
  options: QuestionOption[]
  value: string[]
  onChange: (optionIds: string[]) => void
}

export default function MultiSelect({ options, value, onChange }: Props) {
  const toggle = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter((id) => id !== optionId))
    } else {
      onChange([...value, optionId])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => toggle(option.id)}
          className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
            value.includes(option.id)
              ? 'border-primary bg-primary/10 font-medium text-foreground'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <Checkbox checked={value.includes(option.id)} className="pointer-events-none shrink-0" />
          <span>{option.text}</span>
        </button>
      ))}
    </div>
  )
}
