import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { PATHS } from '@/lib/router/path'
import { cn } from '@/lib/utils'

const links = [{ label: 'About', to: PATHS.about }]

export default function Header() {
  const isAuthed = Boolean(localStorage.getItem('token'))

  return (
    <header className="border-border border-b">
      <nav className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <Link to={PATHS.landing} className="text-base font-bold sm:text-lg">
          QuizFlow
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {links.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'text-sm transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
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
              <Button size="sm" className="whitespace-nowrap">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to={PATHS.auth.login} className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to={PATHS.auth.register}>
                <Button size="sm" className="whitespace-nowrap">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
