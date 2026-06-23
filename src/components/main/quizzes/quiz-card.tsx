import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ArrowRight, Clock, FileDown, Menu, Share2, Trash2, FolderInput, Info } from 'lucide-react'

import type { Quiz } from '@/types/quiz'
import { getModelByValue, DEFAULT_MODEL } from '@/lib/models'
import { TYPE_COLORS, TYPE_LABELS } from '@/components/main/quizzes/utils'
import { useQuizCardActions } from '@/hooks/useQuizCardActions'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu'
import MoveToFolderModal from '../library/move-to-folder-modal'
import ShareQuizModal from './share-quiz-modal'
import ExportPdfModal from './export-pdf-modal'

dayjs.extend(relativeTime)

function getKeyInfo(quiz: Quiz) {
  const isDefault = !quiz.apiKeyId
  const label = isDefault ? 'QuizFlow Default Key' : (quiz.apiKeyName ?? 'BYOK Key')

  if (isDefault) {
    return { label, color: '#A855F7' }
  }

  const colors = ['#14B8A6', '#F43F5E', '#3B82F6', '#F59E0B']
  let hash = 0
  const keyId = quiz.apiKeyId || ''
  for (let i = 0; i < keyId.length; i++) {
    hash = keyId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return { label, color: colors[index] }
}

function getModelInfo(quiz: Quiz) {
  const modelName = quiz.properties?.model || DEFAULT_MODEL
  return getModelByValue(modelName)
}

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const { label: keyLabel, color: keyColor } = getKeyInfo(quiz)
  const { label: modelLabel, color: modelColor } = getModelInfo(quiz)

  const {
    shareToken,
    isPublic,
    publicUrl,
    copied,
    isModalOpen,
    isConfirmOpen,
    isMoveModalOpen,
    isExportModalOpen,
    isExporting,
    isDeleting,
    isSharing,
    isDisabling,
    openQuiz,
    openDeleteConfirm,
    confirmDelete,
    handleShare,
    handleMove,
    handleExportPdf,
    exportPdf,
    copyToClipboard,
    generateShareLink,
    disableShareLink,
    closeShareModal,
    closeConfirm,
    closeMoveModal,
    closeExportModal,
  } = useQuizCardActions(quiz)

  return (
    <>
      <div
        onClick={openQuiz}
        onKeyDown={(e) => {
          // Only when the card itself is focused — nested buttons (burger menu,
          // menu items) bubble their keydown here too, and shouldn't navigate.
          if (e.target !== e.currentTarget) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openQuiz()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Open quiz: ${quiz.title}`}
        className="group bg-card border-border hover:border-primary focus-visible:border-primary focus-visible:ring-primary/30 flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{quiz.title}</h3>
          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Info Icon & Custom Dropdown/Tooltip */}
            <div className="group/info relative flex items-center justify-center">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/30 flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Info className="h-4 w-4" />
              </button>
              <div className="border-border bg-popover text-popover-foreground pointer-events-none absolute top-8 right-0 z-30 w-52 origin-top-right scale-95 rounded-lg border p-3 opacity-0 shadow-md transition-all duration-200 group-focus-within/info:pointer-events-auto group-focus-within/info:scale-100 group-focus-within/info:opacity-100 group-hover/info:pointer-events-auto group-hover/info:scale-100 group-hover/info:opacity-100">
                <div className="space-y-2 text-xs font-normal">
                  <div className="text-foreground border-border/50 border-b pb-1 font-semibold">
                    Generation Details
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      API Key
                    </div>
                    <div className="text-foreground flex items-center gap-1.5 font-medium">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: keyColor,
                          boxShadow: `0 0 5px ${keyColor}80`,
                        }}
                      />
                      <span className="truncate" title={keyLabel}>
                        {keyLabel}
                      </span>
                    </div>
                  </div>
                  <div className="border-border/30 space-y-1 border-t pt-1">
                    <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                      AI Model
                    </div>
                    <div className="text-foreground flex items-center gap-1.5 font-medium">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: modelColor,
                          boxShadow: `0 0 5px ${modelColor}80`,
                        }}
                      />
                      <span className="truncate" title={modelLabel}>
                        {modelLabel}
                      </span>
                    </div>
                  </div>
                  {quiz.tokenUsage && (
                    <div className="border-border/30 space-y-1 border-t pt-1">
                      <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                        Token Usage
                      </div>
                      <div className="text-foreground grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-medium">
                        <span className="text-muted-foreground">Prompt:</span>
                        <span className="text-right tabular-nums">
                          {quiz.tokenUsage.prompt_tokens.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">Completion:</span>
                        <span className="text-right tabular-nums">
                          {quiz.tokenUsage.completion_tokens.toLocaleString()}
                        </span>
                        <span className="text-foreground border-border/30 mt-0.5 border-t pt-0.5 font-semibold">
                          Total:
                        </span>
                        <span className="border-border/30 mt-0.5 border-t pt-0.5 text-right font-semibold tabular-nums">
                          {quiz.tokenUsage.total_tokens.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu
              trigger={<Menu className="h-4 w-4" />}
              ariaLabel="Quiz actions"
              triggerClassName="h-7 w-7 flex items-center justify-center"
            >
              <DropdownItem icon={FolderInput} onClick={handleMove}>
                Move to folder
              </DropdownItem>
              <DropdownItem
                icon={FileDown}
                onClick={handleExportPdf}
                disabled={isExporting || isDeleting}
              >
                Export as PDF
              </DropdownItem>
              <DropdownItem icon={Share2} onClick={handleShare}>
                Share
              </DropdownItem>
              <DropdownItem icon={Trash2} onClick={openDeleteConfirm} destructive>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[quiz.type]}`}
          >
            {TYPE_LABELS[quiz.type]}
          </span>

          {quiz.isTimerEnabled && quiz.timerDuration && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {Math.round(quiz.timerDuration / 60)} min
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <p className="text-muted-foreground text-xs">{dayjs(quiz.createdAt).fromNow()}</p>
          <span className="text-primary flex items-center gap-1 text-xs font-medium transition-transform group-hover:translate-x-0.5">
            Start
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      <ShareQuizModal
        isOpen={isModalOpen}
        onClose={closeShareModal}
        isPublic={isPublic}
        isSharing={isSharing}
        isDisabling={isDisabling}
        shareToken={shareToken}
        publicUrl={publicUrl}
        copied={copied}
        onCopy={copyToClipboard}
        onEnable={generateShareLink}
        onDisable={disableShareLink}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        title="Delete quiz"
        description={`"${quiz.title}" will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
      />
      <MoveToFolderModal
        quizId={quiz.id}
        currentFolderId={quiz.folderId}
        isOpen={isMoveModalOpen}
        onClose={closeMoveModal}
      />
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        onExport={exportPdf}
        isExporting={isExporting}
      />
    </>
  )
}
