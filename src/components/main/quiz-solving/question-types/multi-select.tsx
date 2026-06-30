import { Checkbox } from '@/components/ui/checkbox'
import type { SolvableOption } from '@/types/quiz'
import MarkdownText from '../markdown-text'

type Props = {
  options: SolvableOption[]
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
      {options.map((option) => {
        const isChecked = value.includes(option.id)
        return (
          <div
            key={option.id}
            role="button"
            tabIndex={0}
            onClick={() => toggle(option.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggle(option.id)
              }
            }}
            className={`focus-visible:ring-primary flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors outline-none focus-visible:ring-2 ${
              isChecked
                ? 'border-primary bg-primary/10 text-foreground font-medium'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <Checkbox checked={isChecked} className="pointer-events-none shrink-0" />
            <MarkdownText text={option.text} className="min-w-0 flex-1" as="div" />
          </div>
        )
      })}
    </div>
  )
}
