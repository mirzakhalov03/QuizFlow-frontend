import { Link } from 'react-router-dom'

import { PATHS } from '@/lib/path'
import type { QuizHistoryItem } from '@/types/analytics'

type Props = {
  rows: QuizHistoryItem[]
}

export default function HistoryTable({ rows }: Props) {
  return (
    <div className="border-border bg-background rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Completed quizzes</h3>
      </div>

      {rows.length === 0 ? (
        <div className="text-muted-foreground p-6 text-center text-sm">
          No quizzes taken yet — your results will show up here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-xs uppercase">
              <tr className="border-border border-b">
                <th className="px-4 py-2 text-left font-medium">Quiz</th>
                <th className="px-4 py-2 text-right font-medium">Score</th>
                <th className="px-4 py-2 text-right font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.quizId}-${row.date}`} className="border-border border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      to={PATHS.app.quizResult(row.quizId)}
                      className="text-primary hover:underline"
                    >
                      {row.quizTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.correctAnswers} / {row.totalQuestions}
                    <span className="text-muted-foreground ml-2">({Math.round(row.score)}%)</span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-right whitespace-nowrap">
                    {formatDate(row.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
