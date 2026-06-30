import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/lib/utils'
import Spinner from './spinner'

type Variant = 'primary' | 'outline' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline: 'border border-border bg-background hover:bg-muted',
  ghost: 'hover:bg-muted',
  destructive: 'bg-destructive text-white hover:bg-destructive/90',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? <Spinner size="sm" color="primary-foreground" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

export default Button
