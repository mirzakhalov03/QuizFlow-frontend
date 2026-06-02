import { FileText } from 'lucide-react'
import NotionLogo from '@/assets/notionLogo.png'

type Source = 'file' | 'notion'

type QuizSourceSelectorProps = {
  onSelect: (source: Source) => void
}

export default function QuizSourceSelector({ onSelect }: QuizSourceSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button
        onClick={() => onSelect('file')}
        className="border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 group rounded-xl border-2 p-6 text-left transition-all duration-200"
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 group-hover:bg-blue-200">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="mb-1 font-semibold">Upload Document</h3>
        <p className="text-muted-foreground text-sm">
          PDF, Word, TXT or Markdown files. Max 25 MB.
        </p>
      </button>

      <button
        onClick={() => onSelect('notion')}
        className="border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 group rounded-xl border-2 p-6 text-left transition-all duration-200"
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200">
          <img src={NotionLogo} alt="Notion" className="h-5 w-5" />
        </div>
        <h3 className="mb-1 font-semibold">Notion Page</h3>
        <p className="text-muted-foreground text-sm">
          Generate from your connected Notion workspace.
        </p>
      </button>
    </div>
  )
}
