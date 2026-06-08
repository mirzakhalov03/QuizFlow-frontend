import { useQuizListControls } from '@/hooks/useQuizListControls'

export default function Analytics() {
  const { total } = useQuizListControls()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Analytics</h1>
        <p className="text-muted-foreground text-sm">An overview of your quizzes and activity.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Quizzes" value={String(total)} />
        <Stat label="Responses" value="0" />
        <Stat label="Avg. score" value="—" />
      </div>

      <div className="border-border text-muted-foreground rounded-lg border p-4 text-sm sm:p-6">
        More analytics coming soon.
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-4">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="mt-1 text-xl font-semibold sm:text-2xl">{value}</div>
    </div>
  )
}
