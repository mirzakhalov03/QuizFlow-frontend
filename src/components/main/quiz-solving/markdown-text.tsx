import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/layouts/theme'
import { useEffect, useState } from 'react'

type Props = {
  text: string
  className?: string
}

export default function MarkdownText({ text, className = '' }: Props) {
  const { theme } = useTheme()
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [theme])

  const isDark = theme === 'dark' || (theme === 'system' && systemDark)

  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/)
          if (match) {
            const language = match[1] || 'text'
            const code = match[2].trim()
            return (
              <SyntaxHighlighter
                key={index}
                language={language}
                style={isDark ? oneDark : oneLight}
                className="rounded-lg border"
                customStyle={{
                  margin: '0.75rem 0',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  backgroundColor: 'transparent',
                }}
              >
                {code}
              </SyntaxHighlighter>
            )
          }
        }

        if (!part) return null

        return (
          <span key={index} className="whitespace-pre-wrap">
            {part}
          </span>
        )
      })}
    </div>
  )
}
