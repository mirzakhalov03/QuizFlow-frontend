import { Link } from 'react-router-dom'
import { useTheme } from '@/layouts/theme'
import { cn } from '@/lib/utils'

type LogoProps = {
  to?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'auto' | 'light' | 'dark'
  className?: string
}

const sizeClasses = {
  sm: 'text-base gap-1.5',
  md: 'text-lg gap-2',
  lg: 'text-2xl gap-2.5',
}

export default function Logo({ to, size = 'md', tone = 'auto', className }: LogoProps) {
  const { theme } = useTheme()
  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  const isLightTone = tone === 'light' || (tone === 'auto' && resolvedTheme === 'dark')

  const content = (
    <span
      className={cn(
        'inline-flex items-center font-semibold tracking-tight',
        sizeClasses[size],
        className
      )}
      style={{ fontFamily: "'Audiowide', cursive" }}
    >
      <span className={isLightTone ? 'text-primary-foreground' : 'text-foreground'}>QuizFlow</span>
      <span className={cn('text-primary')}>AI</span>
    </span>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  return content
}
