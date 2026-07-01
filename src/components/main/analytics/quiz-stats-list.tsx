import type { QuizStat } from '@/types/analytics'

type Props = {
  rows: QuizStat[]
}

export default function QuizStatsList({ rows }: Props) {
  return (
    <div className="border-border bg-background rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Per-quiz performance</h3>
      </div>

      {rows.length === 0 ? (
        <div className="text-muted-foreground p-6 text-center text-sm">
          No quizzes in this folder yet.
        </div>
      ) : (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground bg-background sticky top-0 text-xs uppercase">
              <tr className="border-border border-b">
                <th className="px-4 py-2 text-left font-medium">Quiz</th>
                <th className="px-4 py-2 text-right font-medium">Attempts</th>
                <th className="px-4 py-2 text-right font-medium">Avg</th>
                <th className="px-4 py-2 text-right font-medium">Best</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.quizId} className="border-border border-b last:border-b-0">
                  <td className="max-w-56 truncate px-4 py-3" title={r.quizTitle}>
                    {r.quizTitle}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.attemptCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Math.round(r.averageScore)}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{Math.round(r.bestScore)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
