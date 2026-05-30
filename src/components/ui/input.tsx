import * as React from 'react'

import { cn } from '@/lib/utils'
import { Eye, EyeOff, Search } from 'lucide-react'
import { ClassNameValue } from 'tailwind-merge'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean
  suffix?: React.ReactNode
  prefixIcon?: React.ReactNode
  itemClassName?: ClassNameValue
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, fullWidth, suffix, prefixIcon, ...props }, ref) => {
    const [hide, setHide] = React.useState<boolean>(true)
    const iconClassnames = cn(
      'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer transition-colors z-10',
      props.disabled && 'pointer-events-none opacity-50'
    )
    const prefixIconClassnames = cn(
      'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10',
      props.disabled && 'pointer-events-none opacity-50'
    )

    return (
      <div
        className={cn(
          'relative flex items-center',
          fullWidth ? 'w-full' : 'w-full sm:w-max',
          props.hidden ? 'h-0' : 'h-10',
          props?.itemClassName
        )}
      >
        {type === 'search' && (
          <Search
            size={16}
            className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
          />
        )}
        {!!prefixIcon && <span className={prefixIconClassnames}>{prefixIcon}</span>}
        <input
          type={type === 'password' ? (hide ? 'password' : 'text') : type}
          className={cn(
            'bg-popover border-input focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            (type === 'search' || !!prefixIcon) && 'pl-9',
            (type === 'password' || !!suffix) && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
          hidden={props.hidden}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setHide(!hide)}
            className={iconClassnames}
            tabIndex={-1}
          >
            {hide ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
        {!!suffix && (
          <span
            className={cn(
              'text-muted-foreground absolute right-3 top-1/2 z-10 -translate-y-1/2 text-xs font-medium',
              props.disabled && 'pointer-events-none opacity-50'
            )}
          >
            {suffix}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
