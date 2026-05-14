import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type CheckboxProps = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  required?: boolean
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      className,
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled) {
        onCheckedChange?.(!checked)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-required={required}
        id={id}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm',
          'border-input border',
          checked ? 'bg-primary border-primary' : 'bg-background',
          'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !disabled && 'hover:border-primary/50 cursor-pointer',
          'transition-colors duration-200',
          className
        )}
        {...props}
      >
        {checked && (
          <Check
            className={cn(
              'text-primary-foreground h-3.5 w-3.5',
              'transition-transform duration-200',
              checked ? 'scale-100' : 'scale-0'
            )}
            strokeWidth={3}
          />
        )}
      </button>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
