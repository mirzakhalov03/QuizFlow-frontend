import { Link } from "react-router-dom"
import { Sparkles, Zap, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PATHS } from "@/lib/router/path"

const features = [
  {
    icon: Sparkles,
    title: "Create in minutes",
    description: "Build quizzes with an intuitive editor. No setup required.",
  },
  {
    icon: Zap,
    title: "Real-time results",
    description: "Share a link and watch answers stream in live.",
  },
  {
    icon: LineChart,
    title: "Actionable insights",
    description: "Understand what learners know — and what they don't.",
  },
]

export default function Landing() {
  return (
    <>
      <section className="container mx-auto px-4 py-14 text-center sm:py-20 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Build quizzes that learn with you.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          QuizFlow makes it effortless to create, share, and measure what people
          know.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={PATHS.auth.register} className="sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">Get started</Button>
          </Link>
          <Link to={PATHS.about} className="sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn more
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-14 grid gap-4 sm:grid-cols-2 sm:gap-6 sm:pb-16 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-border p-5 bg-background sm:p-6"
          >
            <Icon className="text-primary" size={24} />
            <h3 className="mt-3 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </>
  )
}
