import { useEffect, useMemo, useState, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  History,
  Library,
  ListChecks,
  LogOut,
  Store,
  CircleUser,
  PanelLeft,
  Bookmark,
  MoreHorizontal,
  X,
} from 'lucide-react'
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
  { label: 'Bookmarks', to: PATHS.app.bookmarks, icon: Bookmark },
  { label: 'Explore', to: PATHS.app.marketplace, icon: Store },
  { label: 'History', to: PATHS.app.history, icon: History },
  { label: 'Account', to: PATHS.app.account, icon: CircleUser },
]

const mobilePrimaryOrder = ['Library', 'Quizzes', 'Bookmarks']
const mobilePrimaryItems = mobilePrimaryOrder.map(
  (label) => navItems.find((item) => item.label === label)!
)

const mobileOverflowOrder = ['Explore', 'History', 'Analytics', 'Account']
const mobileOverflowItems = mobileOverflowOrder.map(
  (label) => navItems.find((item) => item.label === label)!
)

const tabletNavOrder = ['Explore', 'Library', 'Quizzes', 'Bookmarks', 'Analytics', 'History']
const tabletNavItems = tabletNavOrder.map((label) => navItems.find((item) => item.label === label)!)

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
  const mobileMenuOpen = useSidebarStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useSidebarStore((s) => s.setMobileMenuOpen)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const firstOverflowRef = useRef<HTMLAnchorElement>(null)
  const navContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        moreButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen, setMobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen, setMobileMenuOpen])

  const handleOverflowKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && index === 0) {
        e.preventDefault()
        moreButtonRef.current?.focus()
      } else if (!e.shiftKey && index === mobileOverflowItems.length - 1) {
        e.preventDefault()
        moreButtonRef.current?.focus()
      }
    }
  }

  const handleMoreKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && mobileMenuOpen) {
      if (!e.shiftKey) {
        e.preventDefault()
        firstOverflowRef.current?.focus()
      } else {
        e.preventDefault()
        const lastItem = document.getElementById(
          `mobile-overflow-item-${mobileOverflowItems.length - 1}`
        )
        lastItem?.focus()
      }
    }
  }

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
              sidebarOpen ? 'opacity-100 delay-100' : 'w-0 overflow-hidden opacity-0'
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
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-200',
                    sidebarOpen
                      ? 'max-w-[120px] translate-x-0 opacity-100'
                      : 'max-w-0 -translate-x-2 opacity-0'
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
        <div className="bg-secondary/8 flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:pb-6 lg:pl-8">
          <Outlet />
        </div>
      </main>

      {/* Semi-transparent backdrop/scrim */}
      <div
        className={cn(
          'bg-background/50 pointer-events-none fixed inset-0 z-30 opacity-0 backdrop-blur-xs transition-opacity duration-300 sm:hidden',
          mobileMenuOpen && 'pointer-events-auto opacity-100'
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Curled Ladder Overflow Menu Container */}
      <div ref={navContainerRef} className="absolute right-0 bottom-0 left-0 z-40 sm:hidden">
        <div className="pointer-events-none absolute right-4 bottom-full left-auto">
          {mobileOverflowItems.map((item, index) => {
            const yOffset = -76 - index * 54
            // A curled crescent shape hook for 4 items
            const xOffsets = [-36, -84, -116, -96]
            const x = xOffsets[index] || -96

            const delay = prefersReducedMotion
              ? '0ms'
              : mobileMenuOpen
                ? `${index * 50}ms`
                : `${(mobileOverflowItems.length - 1 - index) * 35}ms`

            const transform = mobileMenuOpen
              ? `translate3d(${x}px, ${yOffset}px, 0) scale(1)`
              : `translate3d(0px, 0px, 0px) scale(0.75)`

            const opacity = mobileMenuOpen ? 1 : 0

            return (
              <NavLink
                key={item.label}
                id={`mobile-overflow-item-${index}`}
                ref={index === 0 ? firstOverflowRef : undefined}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                tabIndex={mobileMenuOpen ? 0 : -1}
                onKeyDown={(e) => handleOverflowKeyDown(e, index)}
                style={{
                  transform: prefersReducedMotion ? undefined : transform,
                  opacity,
                  transitionProperty: 'transform, opacity, background-color, border-color',
                  transitionDuration: prefersReducedMotion
                    ? '150ms'
                    : mobileMenuOpen
                      ? '420ms'
                      : '260ms',
                  transitionTimingFunction: prefersReducedMotion
                    ? 'ease'
                    : mobileMenuOpen
                      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      : 'cubic-bezier(0.25, 1, 0.5, 1)',
                  transitionDelay: delay,
                  right: '12px',
                  left: 'auto',
                  transformOrigin: 'center center',
                }}
                className={cn(
                  'border-border bg-card text-foreground hover:bg-muted focus-visible:ring-primary absolute bottom-0 z-40 flex h-11 min-w-[120px] items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:outline-none',
                  mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={15}
                      className={cn(
                        'shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Primary Mobile Bottom Nav (3 items + 1 More) */}
      <nav
        aria-label="Mobile navigation"
        className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-40 flex h-16 border-t px-2 shadow-lg backdrop-blur-md sm:hidden"
      >
        <div className="mx-auto flex w-full max-w-lg items-center justify-around">
          {Array.from({ length: 4 }).map((_, colIndex) => {
            if (colIndex === 3) {
              return (
                <button
                  key="more-button-toggle"
                  ref={moreButtonRef}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  onKeyDown={handleMoreKeyDown}
                  aria-expanded={mobileMenuOpen}
                  aria-haspopup="true"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'More options'}
                  className="focus-visible:ring-primary flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="relative h-5 w-5">
                    <MoreHorizontal
                      size={20}
                      className={cn(
                        'absolute inset-0 transform transition-all duration-300',
                        mobileMenuOpen
                          ? 'pointer-events-none scale-50 rotate-90 opacity-0'
                          : 'scale-100 rotate-0 opacity-100'
                      )}
                    />
                    <X
                      size={20}
                      className={cn(
                        'text-primary absolute inset-0 transform transition-all duration-300',
                        mobileMenuOpen
                          ? 'scale-100 rotate-0 opacity-100'
                          : 'pointer-events-none scale-50 -rotate-90 opacity-0'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors duration-200',
                      mobileMenuOpen ? 'text-primary font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    More
                  </span>
                </button>
              )
            }

            const itemIndex = colIndex
            const item = mobilePrimaryItems[itemIndex]
            if (!item) return null

            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="focus-visible:ring-primary flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={20}
                      className={cn(
                        'transition-colors duration-200',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] font-medium transition-colors duration-200',
                        isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Tablet Bottom Nav (All 6 items shown flat) */}
      <nav
        aria-label="Tablet navigation"
        className="border-border bg-background fixed inset-x-0 bottom-0 z-40 hidden h-16 border-t px-4 shadow-lg sm:flex lg:hidden"
      >
        <div className="mx-auto flex w-full max-w-2xl items-center justify-around">
          {tabletNavItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className="focus-visible:ring-primary flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={cn(
                      'transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors duration-200',
                      isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
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
