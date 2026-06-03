import { useEffect, useMemo } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, LayoutDashboard, ListChecks, LogOut, Settings } from 'lucide-react'
import { PATHS } from '@/lib/path'
import { Button } from '@/components/ui/button'
import Logo from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils'
import { logout } from '@/functions/logOut'
import { useAuthStore } from '@/store/use-authstore'
import { useUserProfileStore } from '@/store/userProfileStore'
import { useGlobalStore } from '@/store/global-store'
import QuizTimer from '@/components/main/quiz-solving/quiz-timer'
import QuizProgress from '@/components/main/quiz-solving/quiz-progress'
import type { QuizSolvingHeader } from '@/pages/main/quizSolvingUI'
import { QUIZ_SOLVING_HEADER_KEY } from '@/pages/main/quizSolvingUI'
import OnboardingModal from '@/components/main/onboarding/onboarding-modal'

const navItems = [
  { label: 'Dashboard', to: PATHS.app.dashboard, icon: LayoutDashboard },
  { label: 'Quizzes', to: PATHS.app.quizzes, icon: ListChecks },
  { label: 'Analytics', to: PATHS.app.analytics, icon: BarChart3 },
  { label: 'Settings', to: PATHS.app.settings, icon: Settings },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { profilePicture, fetchProfile } = useUserProfileStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const onLogout = async () => {
    await logout(navigate)
  }

  const onOpenAccount = () => {
    navigate(PATHS.app.account)
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
      <aside className="border-border bg-background sticky top-0 hidden h-screen w-70 shrink-0 flex-col gap-4 border-r p-4 lg:flex">
        <Logo to={PATHS.app.dashboard} size="lg" className="mt-1 flex justify-center" />

        <nav className="mt-5 flex flex-col gap-1">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <Button
            variant="ghost"
            size="md"
            onClick={onLogout}
            className="w-full justify-start text-red-500"
            leftIcon={<LogOut size={18} />}
          >
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col">
        <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-4 sm:px-6">
          <Logo to={PATHS.app.dashboard} size="sm" className="lg:hidden" />
          {quizHeader && (
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
          )}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenAccount}
              className="hover:bg-muted flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                {profilePicture ? (
                  <img src={profilePicture} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center text-sm font-semibold">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm leading-tight font-semibold">Hi, {firstName}</p>
                <p className="text-muted-foreground text-xs">{today}</p>
              </div>
            </button>
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
        <div className="bg-secondary/15 flex-1 overflow-y-auto p-4 pb-20 sm:p-6 sm:pb-24 lg:pb-6">
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

      <OnboardingModal />
    </div>
  )
}
