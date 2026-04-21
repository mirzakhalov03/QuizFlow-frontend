export default function Quizzes() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Quizzes</h1>
        <p className="text-sm text-muted-foreground">
          Manage your quizzes here.
        </p>
      </header>

      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground sm:p-6">
        No quizzes yet.
      </div>
    </div>
  )
}
