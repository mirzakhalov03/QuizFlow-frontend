import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Logo from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { PATHS } from '@/lib/path'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/use-authstore'
import { Menu, X } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'

const links = [
  { label: 'Home', to: PATHS.landing },
  { label: 'Features', to: PATHS.features },
  { label: 'Explore', to: PATHS.marketplace },
  { label: 'Contact', to: PATHS.contact },
  { label: 'Pricing', to: PATHS.pricing },
]

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const isAuthed = !!user
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerRef = useClickOutside<HTMLElement>(() => setMobileMenuOpen(false))

  return (
    <header ref={headerRef} className="border-border bg-background/85 supports-backdrop-filter:bg-background/70 sticky top-0 z-50 border-b shadow-sm backdrop-blur">
      <nav className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:py-4">
        <Logo to={PATHS.landing} size="md" />

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-6 md:flex">
          {links.map(({ label, to }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'transition-colors',
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

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2">
            {isAuthed ? (
              <Link to={PATHS.app.quizzes}>
                <Button size="sm" className="whitespace-nowrap">
                  Open app
                </Button>
              </Link>
            ) : (
              <>
                <Link to={PATHS.auth.login}>
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

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background hover:bg-muted md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          'border-border bg-background/95 md:hidden shadow-md backdrop-blur transition-all duration-300 ease-in-out origin-top overflow-hidden',
          mobileMenuOpen
            ? 'border-b max-h-[400px] opacity-100 scale-y-100 py-4 visible'
            : 'border-b-0 max-h-0 opacity-0 scale-y-95 py-0 invisible pointer-events-none'
        )}
      >
        <div className={cn('transition-opacity duration-200', mobileMenuOpen ? 'opacity-100' : 'opacity-0')}>
          <ul className="flex flex-col gap-4 px-6 pb-4">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block text-sm font-medium transition-colors py-1',
                      isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                    )
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <hr className="border-border mx-6 mb-4" />
          <div className="flex flex-col gap-2 px-6">
            {isAuthed ? (
              <Link to={PATHS.app.quizzes} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-center" size="sm">
                  Open app
                </Button>
              </Link>
            ) : (
              <>
                <Link to={PATHS.auth.login} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-center" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to={PATHS.auth.register} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full text-center" size="sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
