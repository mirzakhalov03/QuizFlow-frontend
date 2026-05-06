import { Link } from 'react-router-dom'
import { CirclePlay } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'
import FeaturesSection from '@/components/landing/FeaturesSection'

export default function Landing() {
  return (
    <>
      <section className="container mx-auto grid items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-20">
        <div className="max-w-2xl">
          <p className="bg-primary/10 text-primary enter-fade-up inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
            The future of study
          </p>

          <h1 className="enter-fade-up enter-delay-1 mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Turn study materials into <span className="text-primary italic">interactive</span>{' '}
            quizzes instantly.
          </h1>

          <p className="text-muted-foreground enter-fade-up enter-delay-2 mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            Leverage the power of AI to transform PDFs, notes, and articles into deep-learning
            experiences. Stop reading, start recalling.
          </p>

          <div className="enter-fade-up enter-delay-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link to={PATHS.auth.register} className="sm:w-auto">
              <Button size="lg" className="w-full px-7 sm:w-auto">
                Get Started for Free
              </Button>
            </Link>
            <Link to={PATHS.features} className="sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                leftIcon={<CirclePlay size={18} />}
              >
                See how it works
              </Button>
            </Link>
          </div>

          <div className="enter-fade-up enter-delay-4 mt-7 flex items-center gap-3 text-sm">
            <div className="flex items-center -space-x-3">
              <span className="border-background bg-foreground/30 inline-flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold">
                JM
              </span>
              <span className="border-background bg-foreground/20 inline-flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold">
                SN
              </span>
              <span className="border-background bg-foreground/10 inline-flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold">
                OM
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Built for researchers, students and educators
            </p>
          </div>
        </div>

        <div className="enter-fade-right enter-delay-2 relative">
          <div className="from-background to-muted/40 border-border hero-breathe overflow- relative rounded-3xl border bg-linear-to-br p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="to-background border-border from-muted/50 relative aspect-5/4 rounded-2xl border bg-linear-to-br p-6">
              <p className="mt-15 text-center">
                Imagine there's a nice dashboard preview here, haha
              </p>
            </div>

            <div className="enter-fade-up enter-delay-4 border-border bg-card absolute -bottom-4 left-5 max-w-57.5 rounded-xl border p-3 shadow-lg sm:left-8 sm:p-4">
              <p className="text-primary text-[10px] font-semibold tracking-[0.15em] uppercase">
                Processing
              </p>
              <p className="mt-1 text-sm font-semibold">Biology Lecture_04.pdf</p>
              <div className="bg-muted mt-3 h-1.5 rounded-full">
                <div className="bg-primary h-full w-2/3 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection visibleCount={3} />
    </>
  )
}
