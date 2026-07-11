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
  { label: 'Quizzes', to: PATHS.app.quizzes },
  { label: 'Get started', to: PATHS.auth.register },
  { label: 'Support', to: PATHS.auth.login },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40 text-foreground">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr] lg:gap-12">
          <div>
            <Logo to={PATHS.landing} size="lg" tone="auto" />
            <p className="text-muted-foreground mt-2 text-xs font-medium tracking-[0.2em] uppercase">
              Learn Faster
            </p>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
              Turn notes, PDFs, and lectures into interactive quizzes that stick.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.15em] uppercase">
                Product
              </p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {productLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.15em] uppercase">
                Company
              </p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {companyLinks.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:justify-self-end md:text-right">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.15em] uppercase">
              Start now
            </p>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm md:ml-auto">
              Ready to test your understanding in minutes?
            </p>
            <Link
              to={PATHS.auth.register}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex rounded-md px-4 py-2 text-sm font-semibold transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-10 border-t pt-5 text-xs sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QuizFlow. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Built for students, educators, and teams.</p>
        </div>
      </div>
    </footer>
  )
}
