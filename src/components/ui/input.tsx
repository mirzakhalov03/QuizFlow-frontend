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
    const iconClassnames = `absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground h-full box-content cursor-pointer backdrop-blur z-2 ${props.disabled && 'pointer-events-none cursor-not-allowed opacity-50'}`
    const searchIconClassnames = `absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-0.5 box-content cursor-pointer backdrop-blur z-1 ${props.disabled && 'pointer-events-none cursor-not-allowed opacity-50'}`

    return (
      <div
        className={cn(
          `${fullWidth ? 'w-full' : 'w-full sm:w-max'} ${props.hidden ? 'h-0' : 'h-10'} relative flex items-center`,
          props?.itemClassName
        )}
      >
        {type === 'search' && <Search width={16} className={searchIconClassnames} />}
        {!!prefixIcon && (
          <span className="text-muted-foreground absolute top-1/2 left-1 z-1 box-content -translate-y-1/2 cursor-pointer p-1 backdrop-blur">
            {prefixIcon}
          </span>
        )}
        <input
          type={type === 'password' ? (hide ? 'password' : 'text') : type}
          className={cn(
            'no-time-icon bg-popover border-input focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            (type === 'search' || !!prefixIcon) && 'pr-7',
            (type === 'password' || !!suffix) && 'pr-8',
            className
          )}
          ref={ref}
          {...props}
          hidden={props.hidden}
        />
        {type === 'password' &&
          (hide ? (
            <Eye width={18} className={iconClassnames} onClick={() => setHide(false)} />
          ) : (
            <EyeOff width={18} className={iconClassnames} onClick={() => setHide(true)} />
          ))}
        {!!suffix && (
          <span
            className={`text-muted-foreground absolute top-1 right-1 z-1 box-content cursor-pointer p-1 backdrop-blur ${props.disabled && 'pointer-events-none cursor-not-allowed opacity-50'}`}
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
