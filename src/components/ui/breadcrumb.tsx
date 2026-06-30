import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Crumb = {
  label: string
  /** Omit on the current (last) page so it renders as plain text. */
  to?: string
}

/**
 * Slash-separated breadcrumb trail, e.g. Quizzes / Algebra Basics / Question 2.
 * Items with a `to` are links; the trailing item is the current page.
 */
export default function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li className="flex items-center">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="hover:text-foreground max-w-50 truncate transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn('max-w-50 truncate', isLast && 'text-foreground font-medium')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
