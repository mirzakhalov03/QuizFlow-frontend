export default function Quizzes() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Quizzes</h1>
        <p className="text-muted-foreground text-sm">Manage your quizzes here.</p>
      </header>

      <div className="border-border text-muted-foreground rounded-lg border p-4 text-sm sm:p-6">
        No quizzes yet.
      </div>
    </div>
  )
}
