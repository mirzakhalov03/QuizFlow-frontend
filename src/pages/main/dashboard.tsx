export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Here's what's happening.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Quizzes" value="0" />
        <Stat label="Responses" value="0" />
        <Stat label="Avg. score" value="—" />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4 bg-background">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold sm:text-2xl">{value}</div>
    </div>
  )
}
