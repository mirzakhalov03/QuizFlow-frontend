import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/path'

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={PATHS.app.quizzes}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to quizzes
          </Button>
        </Link>
      </div>

      <div className="border-border rounded-xl border p-8 text-center">
        <p className="text-muted-foreground text-sm">Quiz solver coming soon</p>
        <p className="text-muted-foreground mt-1 font-mono text-xs">id: {id}</p>
      </div>
    </div>
  )
}
