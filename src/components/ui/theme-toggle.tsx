import { useState, useRef, useEffect } from 'react'
import { Moon, Palette, Sun } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '@/layouts/theme'
import { useThemeContext } from '@/layouts/color'
import { cn } from '@/lib/utils'

const availableThemeColors: {
  name: ThemeColors
  label: string
  light: string
  dark: string
}[] = [
  { name: 'Telegram', label: 'Telegram', light: 'bg-sky-500', dark: 'bg-blue-500' },
  { name: 'Green', label: 'Green', light: 'bg-green-600', dark: 'bg-green-500' },
  { name: 'Violet', label: 'Violet', light: 'bg-violet-600', dark: 'bg-violet-500' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { themeColor, setThemeColor } = useThemeContext()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const resolvedMode =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Theme">
        <Palette className="h-5 w-5" />
      </Button>

      {open && (
        <div className="border-border bg-popover text-popover-foreground absolute right-0 z-50 mt-2 w-64 space-y-4 rounded-md border p-4 shadow-md">
          <div className="space-y-2">
            <div className="text-sm font-medium">Mode</div>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                leftIcon={<Sun className="h-4 w-4" />}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                leftIcon={<Moon className="h-4 w-4" />}
              >
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Color</div>
            <div className="grid grid-cols-1 gap-2">
              {availableThemeColors.map(({ name, label, light, dark }) => (
                <Button
                  key={name}
                  size="sm"
                  variant={themeColor === name ? 'primary' : 'outline'}
                  onClick={() => setThemeColor(name)}
                  leftIcon={
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full',
                        resolvedMode === 'light' ? light : dark
                      )}
                    />
                  }
                  className="justify-start"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
