import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type IProps = {
  children: ReactNode
  required: boolean
  htmlFor?: string
  isError: boolean
  className?: string
  disabled?: boolean
  icon?: ReactNode
}

export default function FieldLabel({
  required,
  children,
  htmlFor,
  isError,
  className,
  disabled,
  icon,
}: IProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-1.5 pb-1.5 text-sm leading-[1.4] select-none',
        isError && 'text-red-600',
        className,
        disabled && 'text-muted-foreground'
      )}
      htmlFor={htmlFor}
    >
      {icon && <span className="text-muted-foreground inline-flex items-center">{icon}</span>}
      <span>
        {children}
        {required && <span className="pl-1 text-red-600">*</span>}
      </span>
    </label>
  )
}
