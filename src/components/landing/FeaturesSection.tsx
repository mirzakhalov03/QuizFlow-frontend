import { LineChart, Sparkles, Zap } from 'lucide-react'
import Button from '../ui/button'

const features = [
  {
    icon: Sparkles,
    title: 'Create in minutes',
    description: 'Build quizzes with an intuitive editor. No setup required.',
  },
  {
    icon: Zap,
    title: 'Real-time results',
    description: 'Share a link and watch answers stream in live.',
  },
  {
    icon: LineChart,
    title: 'Actionable insights',
    description: "Understand what learners know — and what they don't.",
  },
]

const FeaturesSection = () => {
  return (
    <section className="container mx-auto px-4 py-20 pb-14 sm:pb-16 lg:pb-20">
      <div className="container mx-auto px-4">
        <h2 className="pb-10 text-center text-3xl font-bold sm:text-4xl">
          Why choose QuizFlow AI?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
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
        <Button variant="primary" size="lg" className="mx-auto mt-10 block">
          See it in action
        </Button>
      </div>
    </section>
  )
}

export default FeaturesSection
