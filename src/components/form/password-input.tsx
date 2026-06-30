import { useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Password field with a show/hide toggle. Forwards all standard input props. */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn(
          'border-border bg-background h-10 w-full rounded-md border pr-10 pl-3 text-sm',
          'focus:border-primary focus:ring-primary/40 focus:ring-2 focus:outline-none',
          className
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
