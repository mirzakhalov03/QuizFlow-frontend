import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, History, Library, ListChecks, LogOut, Store, CircleUser, PanelLeft } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { PATHS } from '@/lib/path'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import Logo from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { logout } from '@/functions/logOut'
import { useAuthStore } from '@/store/use-authstore'
import { useUserProfileStore } from '@/store/userProfileStore'
import { useGlobalStore } from '@/store/global-store'
import QuizTimer from '@/components/main/quiz-solving/quiz-timer'
import QuizProgress from '@/components/main/quiz-solving/quiz-progress'
import type { QuizSolvingHeader } from '@/pages/main/quiz-solving/context'
import { QUIZ_SOLVING_HEADER_KEY } from '@/pages/main/quiz-solving/context'
import OnboardingModal from '@/components/main/onboarding/onboarding-modal'
import { useSidebarStore } from '@/store/use-sidebar-store'
import { INTEGRATIONS } from '@/constants/api-endpoints'
import { getRequest } from '@/hooks/useGet'

const navItems = [
  { label: 'Quizzes', to: PATHS.app.quizzes, icon: ListChecks },
  { label: 'Analytics', to: PATHS.app.analytics, icon: BarChart3 },
  { label: 'Library', to: PATHS.app.library, icon: Library },
  { label: 'Explore', to: PATHS.app.marketplace, icon: Store },
  { label: 'History', to: PATHS.app.history, icon: History },
  { label: 'Account', to: PATHS.app.account, icon: CircleUser },
]

const mobileNavItems = navItems.filter((item) => item.label !== 'Account')

export default function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { profilePicture, fetchProfile } = useUserProfileStore()
  const queryClient = useQueryClient()

  useEffect(() => {
    fetchProfile()
    // Pre-warm the integrations cache so the quiz-source modal can read
    // Notion's connected state instantly, without waiting for a network
    // round-trip at the moment the modal first opens.
    queryClient.prefetchQuery({
      queryKey: [INTEGRATIONS],
      queryFn: () => getRequest(INTEGRATIONS),
      staleTime: 1000 * 5 * 60, // 5 min — matches useGet's DEFAULT_STALE_TIME
    })
  }, [fetchProfile, queryClient])

  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  
  const sidebarOpen = useSidebarStore((s) => s.sidebarOpen)
  const setSidebarOpen = useSidebarStore((s) => s.setSidebarOpen)

  const handleConfirmLogout = async () => {
    setLoggingOut(true)
    try {
      await logout(navigate)
    } finally {
      setLoggingOut(false)
      setConfirmingLogout(false)
    }
  }

  const quizHeader = useGlobalStore(
    (s) => s.dataMap[QUIZ_SOLVING_HEADER_KEY] as QuizSolvingHeader | undefined
  )

  const parts = user?.fullName?.trim().split(' ') ?? []
  const firstName = parts[0] || parts.at(-1) || 'there'

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  )

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <aside
        className={cn(
          'border-border bg-background sticky top-0 z-50 hidden h-screen shrink-0 flex-col gap-4 border-r p-3 transition-[width] duration-300 ease-in-out lg:flex',
          sidebarOpen ? 'w-60' : 'w-[68px]'
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Logo
            to={PATHS.app.quizzes}
            size="lg"
            className={cn(
              'flex items-center transition-opacity duration-200',
              sidebarOpen ? 'opacity-100 delay-100' : 'opacity-0 w-0 overflow-hidden'
            )}
          />
          <div className="group relative">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className={cn(
                'text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors',
               !sidebarOpen && 'mx-auto'
            )}
            >
            <PanelLeft size={18} />
            </button>

            <span className="text-popover-foreground bg-popover border-border pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 scale-95 rounded-md border px-2.5 py-1.5 text-sm font-medium whitespace-nowrap opacity-0 shadow-md transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
              {sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
             </span>
          </div>
        </div>

        <nav className="mt-2 flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon size={20} className="shrink-0" />

           <>
            <span className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-200',
                    sidebarOpen
                    ? 'max-w-[120px] opacity-100 translate-x-0'
                    : 'max-w-0 opacity-0 -translate-x-2'
                   )}
              >
            {label}
            </span>

            {!sidebarOpen && (
              <span className="text-popover-foreground bg-popover border-border pointer-events-none absolute left-full z-50 ml-2 scale-95 rounded-md border px-2.5 py-1.5 text-sm font-medium whitespace-nowrap opacity-0 shadow-md transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
               {label}
              </span>
           )}
          </>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="group relative">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setConfirmingLogout(true)}
              className={cn(
                'w-full overflow-hidden text-red-500',
                sidebarOpen ? 'justify-start' : 'justify-center px-0'
              )}
              leftIcon={<LogOut size={18} className="shrink-0" />}
            >
              {sidebarOpen && <span className="whitespace-nowrap">Logout</span>}
            </Button>

            {!sidebarOpen && (
              <span className="text-popover-foreground bg-popover border-border pointer-events-none absolute top-1/2 left-full z-50 ml-2 -translate-y-1/2 scale-95 rounded-md border px-2.5 py-1.5 text-sm font-medium whitespace-nowrap opacity-0 shadow-md transition-all duration-150 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                Logout
              </span>
            )}
          </div>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
          <Logo to={PATHS.app.quizzes} size="sm" className="lg:hidden" />
          {quizHeader ? (
            <div className="hidden min-w-0 flex-1 items-center gap-4 lg:flex">
              <p className="text-sm font-semibold whitespace-nowrap">{quizHeader.title}</p>
              <div className="min-w-0 flex-1 overflow-x-auto">
                <QuizProgress
                  questions={quizHeader.questions}
                  answers={quizHeader.answers}
                  activeIndex={quizHeader.activeIndex}
                  onSelect={quizHeader.onSelect}
                />
              </div>
              {quizHeader.isTimerEnabled && <QuizTimer timeRemaining={quizHeader.timeRemaining} />}
            </div>
          ) : (
            <div className="hidden text-left lg:block">
              <p className="text-sm leading-tight font-semibold">Hi, {firstName}</p>
              <p className="text-muted-foreground text-xs">{today}</p>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {quizHeader?.isTimerEnabled && (
              <div className="lg:hidden">
                <QuizTimer timeRemaining={quizHeader.timeRemaining} />
              </div>
            )}
            <ThemeToggle />
            <NavLink
              to={PATHS.app.account}
              aria-label="Account"
              className="ring-offset-background focus-visible:ring-primary block h-8 w-8 shrink-0 overflow-hidden rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:pointer-events-none"
            >
              {profilePicture ? (
                <img src={profilePicture} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center text-sm font-semibold">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </NavLink>
            <button
              type="button"
              onClick={() => setConfirmingLogout(true)}
              aria-label="Logout"
              className="hover:bg-muted rounded-md p-1.5 lg:hidden"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <div className="bg-secondary/15 flex-1 overflow-y-auto p-4 pb-20 sm:p-6 lg:pl-8 sm:pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>

      <nav
        aria-label="Primary"
        className="border-border bg-background fixed inset-x-0 bottom-0 z-40 flex border-t lg:hidden"
      >
        {mobileNavItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex flex-1 flex-col items-center justify-center px-1 py-1.5"
          >
            {({ isActive }) => (
              <span
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-colors',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon size={20} />
                <span>{label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <OnboardingModal />

      <ConfirmDialog
        isOpen={confirmingLogout}
        onClose={() => setConfirmingLogout(false)}
        onConfirm={handleConfirmLogout}
        title="Log out?"
        description="You'll need to sign in again to access your account."
        confirmLabel="Log out"
        variant="destructive"
        loading={loggingOut}
      />
    </div>
  )
}