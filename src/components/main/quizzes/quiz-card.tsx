import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  FileDown,
  Menu,
  Share2,
  Trash2,
  Zap,
  FolderInput,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useDelete } from '@/hooks/useDelete'
import { QUIZ_BY_ID, QUIZ_LIST, QUIZ_SHARE_ENABLE } from '@/constants/api-endpoints'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { openQuizPdf } from '@/lib/quiz-pdf'
import type { PaginatedResponse, Quiz } from '@/types/quiz'
import { TYPE_COLORS, TYPE_LABELS } from '@/components/main/quizzes/utils'
import { PATHS } from '@/lib/path'
import { usePatch } from '@/hooks/usePatch'
import Modal from '@/components/custom/modal'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownItem } from '@/components/ui/dropdown-menu'

import Spinner from '@/components/ui/spinner'
import MoveToFolderModal from '../library/move-to-folder-modal'

dayjs.extend(relativeTime)

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [shareToken, setShareToken] = useState<string | null>(quiz.shareToken || null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { mutate: deleteQuiz, isPending: isDeleting } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
      setIsConfirmOpen(false)
      toast.success('Quiz deleted')
    },
  })

  const { mutate: enableShare, isPending: isSharing } = usePatch({
    onSuccess: (data: { data: { shareToken: string } }) => {
      const token = data.data.shareToken
      setShareToken(token)
      // Update the quiz list cache with the new token
      queryClient.setQueriesData<PaginatedResponse<Quiz>>({ queryKey: [QUIZ_LIST] }, (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item) =>
              item.id === quiz.id ? { ...item, shareToken: token } : item
            ),
          },
        }
      })
    },
    onError: () => {
      toast.error('Failed to generate share link')
    },
  })

  const openDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirmOpen(true)
  }

  const confirmDelete = () => {
    deleteQuiz(QUIZ_BY_ID(quiz.id))
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSharing) return

    setIsModalOpen(true)
    if (!shareToken) {
      enableShare(QUIZ_SHARE_ENABLE(quiz.id), {})
    }
  }

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMoveModalOpen(true)
  }
  const handleExportPdf = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExporting) return

    setIsExporting(true)
    try {
      await openQuizPdf(quiz.id)
    } finally {
      setIsExporting(false)
    }
  }

  const publicUrl = useMemo(() => {
    return shareToken ? window.location.origin + PATHS.public.quiz(shareToken) : ''
  }, [shareToken])

  const copyToClipboard = () => {
    if (!publicUrl) return
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success('Link copied to clipboard')
      })
      .catch(() => {
        toast.error('Failed to copy link')
      })
  }

  const openQuiz = () => navigate(PATHS.app.quiz(quiz.id))

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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Quiz"
        description="Anyone with this link can view the quiz questions."
      >
        <div className="flex flex-col gap-4 py-4">
          {isSharing ? (
            <div className="flex h-20 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : !shareToken ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-destructive text-sm">Failed to generate share link.</p>
              <Button size="sm" onClick={() => enableShare(QUIZ_SHARE_ENABLE(quiz.id), {})}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input value={publicUrl} readOnly fullWidth />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                  aria-label="Copy link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Note: This link allows read-only access. Users cannot submit answers or see correct
                ones.
              </p>
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
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
        onClose={() => setIsMoveModalOpen(false)}
      />
    </>
  )
}
