import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, Settings } from 'lucide-react'
import { PATHS } from '@/lib/router/path'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', to: PATHS.app.dashboard, icon: LayoutDashboard },
  { label: 'Quizzes', to: PATHS.app.quizzes, icon: ListChecks },
  { label: 'Settings', to: PATHS.app.settings, icon: Settings },
]

export default function AppLayout() {
  const navigate = useNavigate()

  const onLogout = () => {
    localStorage.removeItem('token')
    navigate(PATHS.landing, { replace: true })
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside className="border-border bg-background hidden w-60 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
        <Link to={PATHS.app.dashboard} className="text-lg font-semibold">
          QuizFlow
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            leftIcon={<LogOut size={14} />}
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
          <span className="text-sm font-semibold lg:hidden">QuizFlow</span>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              className="hover:bg-muted rounded-md p-1.5 lg:hidden"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 pb-20 sm:p-6 sm:pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Primary"
        className="border-border bg-background fixed inset-x-0 bottom-0 z-40 flex border-t lg:hidden"
      >
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
