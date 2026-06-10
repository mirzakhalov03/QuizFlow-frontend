import type { TypeBreakdown } from '@/types/analytics'
import type { QuestionType } from '@/types/quiz'

type Props = {
  rows: TypeBreakdown[]
}

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: 'Multiple choice',
  multi_select: 'Multi-select',
  open_ended: 'Open-ended',
  true_false: 'True / false',
  mixed: 'Mixed',
}

export default function TypeBreakdownTable({ rows }: Props) {
  return (
    <div className="border-border bg-background rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Breakdown by question type</h3>
      </div>

      {rows.length === 0 ? (
        <div className="text-muted-foreground p-6 text-center text-sm">
          Take a quiz to see your performance by question type.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-xs uppercase">
              <tr className="border-border border-b">
                <th className="px-4 py-2 text-left font-medium">Type</th>
                <th className="px-4 py-2 text-right font-medium">Quizzes</th>
                <th className="px-4 py-2 text-right font-medium">Avg. score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.type} className="border-border border-b last:border-b-0">
                  <td className="px-4 py-3">{TYPE_LABEL[row.type] ?? row.type}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{row.quizCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Math.round(row.averageScore)}%
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
