import { Link } from 'react-router-dom'
import Logo from '@/components/ui/logo'
import { PATHS } from '@/lib/path'

const productLinks = [
  { label: 'Home', to: PATHS.landing },
  { label: 'Features', to: PATHS.features },
  { label: 'Pricing', to: PATHS.pricing },
  { label: 'Contact', to: PATHS.contact },
  { label: 'Sign in', to: PATHS.auth.login },
]

const companyLinks = [
  { label: 'Dashboard', to: PATHS.app.dashboard },
  { label: 'Get started', to: PATHS.auth.register },
  { label: 'Support', to: PATHS.auth.login },
]

export default function Footer() {
  return (
    <footer className="border-border bg-primary text-primary-foreground border-t">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr] lg:gap-12">
          <div>
            <Logo to={PATHS.landing} size="lg" tone="light" />
            <p className="text-primary-foreground/70 mt-2 text-xs font-medium tracking-[0.2em] uppercase">
              Learn Faster
            </p>
            <p className="text-primary-foreground/85 mt-4 max-w-xs text-sm leading-relaxed">
              Turn notes, PDFs, and lectures into interactive quizzes that stick.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-primary-foreground/70 text-xs font-semibold tracking-[0.15em] uppercase">
                Product
              </p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {productLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="transition-opacity hover:opacity-80">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-primary-foreground/70 text-xs font-semibold tracking-[0.15em] uppercase">
                Company
              </p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {companyLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="transition-opacity hover:opacity-80">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:justify-self-end md:text-right">
            <p className="text-primary-foreground/70 text-xs font-semibold tracking-[0.15em] uppercase">
              Start now
            </p>
            <p className="text-primary-foreground/85 mt-3 max-w-xs text-sm md:ml-auto">
              Ready to test your understanding in minutes?
            </p>
            <Link
              to={PATHS.auth.register}
              className="bg-primary-foreground text-primary mt-4 inline-flex rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            >
              Create free account
            </Link>
          </div>
        </div>

        <div className="border-primary-foreground/20 text-primary-foreground/75 mt-10 border-t pt-5 text-xs sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QuizFlow. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for students, educators, and teams.</p>
        </div>
      </div>
    </footer>
  )
}
