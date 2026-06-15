import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const passwordRules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Contains a letter', test: (v: string) => /[a-zA-Z]/.test(v) },
  { label: 'Contains a number', test: (v: string) => /[0-9]/.test(v) },
] as const

export const isPasswordValid = (value: string) => passwordRules.every((rule) => rule.test(value))

/** Live checklist of password requirements — each row turns green as it passes. */
export function PasswordRequirements({ value }: { value: string }) {
  return (
    <ul className="space-y-1">
      {passwordRules.map((rule) => {
        const passed = rule.test(value)
        return (
          <li
            key={rule.label}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors',
              passed ? 'text-emerald-600' : 'text-muted-foreground'
            )}
          >
            {passed ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
