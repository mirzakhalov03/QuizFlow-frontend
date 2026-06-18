import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useDelete } from '@/hooks/useDelete'
import { usePatch } from '@/hooks/usePatch'
import { QUIZ_BY_ID, QUIZ_LIST, QUIZ_SHARE_ENABLE } from '@/constants/api-endpoints'
import { toast } from '@/lib/toast'
import { openQuizPdf } from '@/lib/quiz-pdf'
import { PATHS } from '@/lib/path'
import type { PaginatedResponse, Quiz } from '@/types/quiz'

/**
 * All the side-effecting behavior behind a quiz card — delete, share-link
 * issuing + clipboard copy, PDF export, move-to-folder, and navigation — plus
 * the modal/loading flags the card renders against. Keeps `QuizCard` presentational.
 */
export function useQuizCardActions(quiz: Quiz) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [shareToken, setShareToken] = useState<string | null>(quiz.shareToken || null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const { mutate: deleteQuiz, isPending: isDeleting } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
      if (quiz.folderId) {
        queryClient.invalidateQueries({ queryKey: [`/folders/${quiz.folderId}/quizzes`] })
      }
      queryClient.invalidateQueries({ queryKey: ['/folders'] })
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

  const generateShareLink = () => enableShare(QUIZ_SHARE_ENABLE(quiz.id), {})

  const openQuiz = () => navigate(PATHS.app.quiz(quiz.id))

  const openDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirmOpen(true)
  }

  const confirmDelete = () => deleteQuiz(QUIZ_BY_ID(quiz.id))

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isSharing) return
    setIsModalOpen(true)
    if (!shareToken) generateShareLink()
  }

  const handleMove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMoveModalOpen(true)
  }

  const handleExportPdf = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExportModalOpen(true)
  }

  const exportPdf = async (withAnswers: boolean) => {
    if (isExporting) return
    setIsExporting(true)
    try {
      await openQuizPdf(quiz.id, withAnswers)
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

  return {
    shareToken,
    publicUrl,
    copied,
    isModalOpen,
    isConfirmOpen,
    isMoveModalOpen,
    isExportModalOpen,
    isExporting,
    isDeleting,
    isSharing,
    openQuiz,
    openDeleteConfirm,
    confirmDelete,
    handleShare,
    handleMove,
    handleExportPdf,
    exportPdf,
    copyToClipboard,
    generateShareLink,
    closeShareModal: () => setIsModalOpen(false),
    closeConfirm: () => setIsConfirmOpen(false),
    closeMoveModal: () => setIsMoveModalOpen(false),
    closeExportModal: () => setIsExportModalOpen(false),
  }
}
