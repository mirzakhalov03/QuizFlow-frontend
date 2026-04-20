import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, Menu, Settings, X } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = () => setSidebarOpen(false)

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const onLogout = () => {
    localStorage.removeItem('token')
    navigate(PATHS.landing, { replace: true })
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'border-border bg-background fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col gap-4 border-r p-4 transition-transform duration-200 ease-out',
          'lg:static lg:w-60 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between">
          <Link to={PATHS.app.dashboard} onClick={closeSidebar} className="text-lg font-semibold">
            QuizFlow
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="hover:bg-muted rounded-md p-1.5 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
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
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="hover:bg-muted -ml-1 rounded-md p-1.5 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <span className="lg:hidden text-sm font-semibold">QuizFlow</span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
