import { BookMarked, BrainCircuit, Files, LayoutTemplate, NotebookPen, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/router/path'

const features = [
  {
    icon: NotebookPen,
    title: 'Notion one-to-one integration',
    description: 'Sync your notes directly from Notion and convert pages into quiz-ready prompts.',
  },
  {
    icon: BrainCircuit,
    title: 'High-end AI quiz generation',
    description:
      'Generate high-quality questions with advanced AI models tuned for learning outcomes.',
  },
  {
    icon: LayoutTemplate,
    title: 'Multiple question formats',
    description: 'Support for MCQ, true or false, short answer, and mixed-mode assessments.',
  },
  {
    icon: BookMarked,
    title: 'Tailored quiz formats',
    description: 'Customize quiz structure by topic, complexity, and learning goals.',
  },
  {
    icon: Timer,
    title: 'Exam-environment timers',
    description: 'Run timed sessions that simulate real exam conditions for better preparation.',
  },
  {
    icon: Files,
    title: 'Personalized feedback',
    description: 'Receive clear, actionable feedback after each attempt to improve retention.',
  },
]

type FeaturesSectionProps = {
  title?: string
  subtitle?: string
  showCta?: boolean
  visibleCount?: number
}

const FeaturesSection = ({
  title = 'Why choose QuizFlow AI?',
  subtitle = 'Core features designed for modern learning',
  showCta = true,
  visibleCount,
}: FeaturesSectionProps) => {
  const visibleFeatures =
    typeof visibleCount === 'number' ? features.slice(0, visibleCount) : features

  return (
    <section className="py-20 pb-14 sm:pb-16 lg:pb-20">
      <div className="container mx-auto px-4">
        <p className="text-primary text-center text-xs font-semibold tracking-[0.15em] uppercase">
          Features
        </p>
        <h2 className="pt-3 pb-2 text-center text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl pb-10 text-center text-sm sm:text-base">
          {subtitle}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {visibleFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border-border bg-background rounded-lg border p-5 shadow-lg sm:p-6"
            >
              <Icon className="text-primary" size={24} />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            </div>
          ))}
        </div>
        {showCta && (
          <Link to={PATHS.features} className="mx-auto mt-10 block w-fit">
            <Button size="lg">Explore all features</Button>
          </Link>
        )}
      </div>
    </section>
  )
}

export default FeaturesSection
