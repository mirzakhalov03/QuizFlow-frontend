import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ArrowRight, Clock, FileDown, Menu, Share2, Trash2, Zap, FolderInput } from 'lucide-react'

import type { Quiz } from '@/types/quiz'
import { TYPE_COLORS, TYPE_LABELS } from '@/components/main/quizzes/utils'
import { useQuizCardActions } from '@/hooks/useQuizCardActions'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu'
import MoveToFolderModal from '../library/move-to-folder-modal'
import ShareQuizModal from './share-quiz-modal'

dayjs.extend(relativeTime)

export default function QuizCard({ quiz }: { quiz: Quiz }) {
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
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{quiz.title}</h3>
          <DropdownMenu trigger={<Menu className="h-4 w-4" />} ariaLabel="Quiz actions">
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

          {quiz.tokenUsage && (
            <span
              className="text-muted-foreground flex items-center gap-1 text-xs"
              title={
                'Prompt: ' +
                quiz.tokenUsage.prompt_tokens.toLocaleString() +
                ', Completion: ' +
                quiz.tokenUsage.completion_tokens.toLocaleString()
              }
            >
              <Zap className="h-3 w-3 text-amber-500" />
              {quiz.tokenUsage.total_tokens.toLocaleString()}
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
