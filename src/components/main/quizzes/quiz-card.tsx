import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ArrowRight, Clock, FileDown, Menu, Share2, Trash2, FolderInput, Info } from 'lucide-react'

import type { Quiz } from '@/types/quiz'
import { TYPE_COLORS, TYPE_LABELS } from '@/components/main/quizzes/utils'
import { useQuizCardActions } from '@/hooks/useQuizCardActions'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu'
import MoveToFolderModal from '../library/move-to-folder-modal'
import ShareQuizModal from './share-quiz-modal'

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

const MODEL_MAPPING: Record<string, { label: string; color: string }> = {
  'google/gemini-3.5-flash': { label: 'Gemini 3.5 Flash', color: '#14B8A6' },
  'openai/gpt-4o-mini': { label: 'GPT-4o Mini', color: '#10B981' },
  'deepseek/seek-chat-v3': { label: 'DeepSeek V3', color: '#3B82F6' },
  'deepseek/deepseek-chat-v3': { label: 'DeepSeek V3', color: '#3B82F6' },
  'meta-llama/llama-3.3-70b-instruct': { label: 'Llama 3.3 70B', color: '#A855F7' },
}

function getModelInfo(quiz: Quiz) {
  const modelName = quiz.properties?.model || 'google/gemini-3.5-flash'
  return MODEL_MAPPING[modelName] ?? { label: modelName, color: '#64748B' }
}

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const { label: keyLabel, color: keyColor } = getKeyInfo(quiz)
  const { label: modelLabel, color: modelColor } = getModelInfo(quiz)

  const {
    shareToken,
    publicUrl,
    copied,
    isModalOpen,
    isConfirmOpen,
    isMoveModalOpen,
    isExporting,
    isDeleting,
    isSharing,
    openQuiz,
    openDeleteConfirm,
    confirmDelete,
    handleShare,
    handleMove,
    handleExportPdf,
    copyToClipboard,
    generateShareLink,
    closeShareModal,
    closeConfirm,
    closeMoveModal,
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
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* Info Icon & Custom Dropdown/Tooltip */}
            <div className="relative group/info flex items-center justify-center">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/30 rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none flex items-center justify-center h-7 w-7"
              >
                <Info className="h-4 w-4" />
              </button>
              <div className="pointer-events-none absolute right-0 top-8 z-30 w-52 origin-top-right scale-95 opacity-0 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md transition-all duration-200 group-hover/info:pointer-events-auto group-hover/info:scale-100 group-hover/info:opacity-100">
                <div className="space-y-2 text-xs font-normal">
                  <div className="font-semibold text-foreground border-b border-border/50 pb-1">
                    Generation Details
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                      API Key
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
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
                  <div className="space-y-1 pt-1 border-t border-border/30">
                    <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                      AI Model
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
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
                    <div className="space-y-1 pt-1 border-t border-border/30">
                      <div className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                        Token Usage
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-medium text-foreground text-[11px]">
                        <span className="text-muted-foreground">Prompt:</span>
                        <span className="text-right tabular-nums">
                          {quiz.tokenUsage.prompt_tokens.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">Completion:</span>
                        <span className="text-right tabular-nums">
                          {quiz.tokenUsage.completion_tokens.toLocaleString()}
                        </span>
                        <span className="text-foreground font-semibold border-t border-border/30 mt-0.5 pt-0.5">
                          Total:
                        </span>
                        <span className="text-right tabular-nums font-semibold border-t border-border/30 mt-0.5 pt-0.5">
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
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[quiz.type ?? 'mixed']}`}
          >
            {TYPE_LABELS[quiz.type ?? 'mixed']}
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
        isSharing={isSharing}
        shareToken={shareToken}
        publicUrl={publicUrl}
        copied={copied}
        onCopy={copyToClipboard}
        onRetry={generateShareLink}
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
    </>
  )
}
