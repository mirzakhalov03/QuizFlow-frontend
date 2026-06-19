import { useState } from 'react'
import { FileText, GraduationCap, ArrowRight } from 'lucide-react'

import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'

type Props = {
  isOpen: boolean
  onClose: () => void
  onExport: (withAnswers: boolean) => Promise<void>
  isExporting: boolean
}

export default function ExportPdfModal({ isOpen, onClose, onExport, isExporting }: Props) {
  const [withAnswers, setWithAnswers] = useState(false)

  const handleExport = async () => {
    await onExport(withAnswers)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Quiz as PDF"
      description="Choose whether you want to include answers and explanations in the exported document."
      size="max-w-md"
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Study Mode (Without Answers) */}
          <button
            type="button"
            aria-pressed={!withAnswers}
            onClick={() => setWithAnswers(false)}
            className={`focus:ring-primary/20 flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus:ring-2 focus:outline-none ${
              !withAnswers
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border bg-card hover:bg-muted/50 hover:border-border-hover'
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                !withAnswers ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Study Mode</h4>
              <p className="text-muted-foreground mt-1 text-xs">
                Questions only. Best for self-testing, practice sheets, or distributing to students.
              </p>
            </div>
          </button>

          {/* Answer Key (With Answers) */}
          <button
            type="button"
            aria-pressed={!withAnswers}
            onClick={() => setWithAnswers(true)}
            className={`focus:ring-primary/20 flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus:ring-2 focus:outline-none ${
              withAnswers
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-border bg-card hover:bg-muted/50 hover:border-border-hover'
            }`}
          >
            <div
              className={`rounded-lg p-2 ${
                withAnswers ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Answer Key</h4>
              <p className="text-muted-foreground mt-1 text-xs">
                Questions with correct answers, explanations, and suggested open-ended answers.
              </p>
            </div>
          </button>
        </div>

        <div className="border-border mt-4 flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Generate PDF
          </Button>
        </div>
      </div>
    </Modal>
  )
}
