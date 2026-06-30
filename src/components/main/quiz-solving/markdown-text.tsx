import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/layouts/theme'
import { useEffect, useState } from 'react'

type Props = {
  text: string
  className?: string
  as?: 'div' | 'span'
}

export default function MarkdownText({ text, className = '', as: Component = 'div' }: Props) {
  const { theme } = useTheme()
  const [systemDark, setSystemDark] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false)
  )

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return

    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [theme])

  if (!text) return null

  const isDark = theme === 'dark' || (theme === 'system' && systemDark)

  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <Component className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/)
          if (match) {
            const language = match[1] || 'text'
            const code = match[2].trim()
            return (
              <div
                key={index}
                className="border-border bg-muted/30 my-4 overflow-hidden rounded-lg border dark:bg-zinc-900/40"
              >
                {match[1] && (
                  <div className="border-border bg-muted/50 text-muted-foreground flex items-center justify-between border-b px-4 py-1.5 font-mono text-[10px] tracking-wider uppercase">
                    <span>{match[1]}</span>
                  </div>
                )}
                <SyntaxHighlighter
                  language={language}
                  style={isDark ? oneDark : oneLight}
                  customStyle={{
                    margin: 0,
                    padding: '1rem',
                    fontSize: '0.8125rem',
                    lineHeight: '1.6',
                    backgroundColor: 'transparent',
                  }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            )
          }
        }

        if (!part) return null

        // Support inline code like `const x = 1`
        const inlineParts = part.split(/(`[^`]+`)/g)
        return (
          <span key={index} className="whitespace-pre-wrap">
            {inlineParts.map((inlinePart, i) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                const code = inlinePart.slice(1, -1)
                return (
                  <code
                    key={i}
                    className="bg-muted text-foreground border-border rounded-md border px-1.5 py-0.5 font-mono text-[0.85em] font-medium"
                  >
                    {code}
                  </code>
                )
              }
              return inlinePart
            })}
          </span>
        )
      })}
    </Component>
  )
}
