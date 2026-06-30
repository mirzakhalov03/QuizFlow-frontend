import { FileText } from 'lucide-react'
import NotionLogo from '@/assets/notionLogo.png'
import { useHasNotionIntegration } from '@/hooks/useHasNotionIntegration'

type Source = 'file' | 'notion' | 'obsidian'

type QuizSourceSelectorProps = {
  onSelect: (source: Source) => void
}

export default function QuizSourceSelector({ onSelect }: QuizSourceSelectorProps) {
  const { hasIntegration: hasNotion } = useHasNotionIntegration()

  return (
    <div className="grid gap-4 pb-4 sm:grid-cols-2 sm:pb-6">
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
        onClick={() => onSelect('obsidian')}
        className="border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 group rounded-xl border-2 p-6 text-left transition-all duration-200"
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 group-hover:bg-purple-200">
          <svg
            className="h-5 w-5 text-purple-600"
            viewBox="0 0 100 100"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M73.8 9.6C67.4 3.4 59.2 0 50.7 0c-8.5 0-16.6 3.3-22.7 9.3C16.2 21 14.6 38.6 23.2 52.2L49.5 100l26.6-47.7c8.7-13.7 7.2-31.4-2.3-42.7z" />
          </svg>
        </div>
        <h3 className="mb-1 font-semibold">Obsidian Vault</h3>
        <p className="text-muted-foreground text-sm">
          Export your Obsidian notes as Markdown and upload them here.
        </p>
      </button>

      <button
        onClick={() => hasNotion && onSelect('notion')}
        disabled={!hasNotion}
        className="border-border bg-card/50 enabled:hover:border-primary/50 enabled:hover:bg-primary/5 group relative rounded-xl border-2 p-6 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {!hasNotion && (
          <span className="bg-muted text-muted-foreground absolute top-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-medium">
            Not connected
          </span>
        )}
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-enabled:group-hover:bg-gray-200">
          {' '}
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
