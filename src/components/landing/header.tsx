import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { PATHS } from '@/lib/router/path'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Home', to: PATHS.landing },
  { label: 'Features', to: PATHS.features },
  { label: 'Contact', to: PATHS.contact },
  { label: 'Pricing', to: PATHS.pricing },
]

export default function Header() {
  const isAuthed = Boolean(localStorage.getItem('token'))

  return (
    <header className="border-border bg-background/85 supports-backdrop-filter:bg-background/70 sticky top-0 z-50 border-b shadow-sm backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <Link to={PATHS.landing} className="text-base font-bold sm:text-lg">
          QuizFlow <span className="text-primary">AI</span>
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'text-sm transition-colors',
                    isActive
                      ? 'text-primary border-primary border-b-2 pb-1 font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {isAuthed ? (
            <Link to={PATHS.app.dashboard}>
              <Button size="sm" className="whitespace-nowrap">
                Open dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to={PATHS.auth.login} className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to={PATHS.auth.register}>
                <Button size="sm" className="whitespace-nowrap">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
