import { FileText } from 'lucide-react'
import NotionLogo from '@/assets/notionLogo.png'
import { useHasNotionIntegration } from '@/hooks/useHasNotionIntegration'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type Source = 'file' | 'notion'

type QuizSourceSelectorProps = {
  onSelect: (source: Source) => void
}

export default function QuizSourceSelector({ onSelect }: QuizSourceSelectorProps) {
  const { hasIntegration: hasNotion } = useHasNotionIntegration()

  return (
    <div className="grid gap-4 pb-4 sm:grid-cols-2 sm:pb-6">
      {/* Upload Document */}
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

      {/* Notion */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full">
              <button
                onClick={() => hasNotion && onSelect('notion')}
                disabled={!hasNotion}
                className="border-border bg-card/50 enabled:hover:border-primary/50 enabled:hover:bg-primary/5 group relative w-full rounded-xl border-2 p-6 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {!hasNotion && (
                  <span className="bg-muted text-muted-foreground absolute top-3 right-3 rounded-full px-2 py-0.5 text-[11px] font-medium">
                    Not connected
                  </span>
                )}

                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 group-enabled:group-hover:bg-gray-200">
                  <img src={NotionLogo} alt="Notion" className="h-5 w-5" />
                </div>

                <h3 className="mb-1 font-semibold">Notion Page</h3>

                <p className="text-muted-foreground text-sm">
                  Generate from your connected Notion workspace.
                </p>
              </button>
            </div>
          </TooltipTrigger>

          {!hasNotion && (
            <TooltipContent
              side="top"
              align="center"
              sideOffset={6}
              className="max-w-[180px] rounded-md px-2 py-1 text-center text-[11px]"
            >
              Connect Notion in the <strong>Account</strong> page.
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
