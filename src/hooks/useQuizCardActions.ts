import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

import { useDelete } from '@/hooks/useDelete'
import { usePatch } from '@/hooks/usePatch'
import {
  QUIZ_BY_ID,
  QUIZ_LIST,
  QUIZ_SHARE_DISABLE,
  QUIZ_SHARE_ENABLE,
} from '@/constants/api-endpoints'
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
  const [isPublic, setIsPublic] = useState<boolean>(quiz.isPublic ?? false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

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
      setIsPublic(true)
      // Update the quiz list cache with the new token
      queryClient.setQueriesData<PaginatedResponse<Quiz>>({ queryKey: [QUIZ_LIST] }, (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item) =>
              item.id === quiz.id ? { ...item, shareToken: token, isPublic: true } : item
            ),
          },
        }
      })
    },
    onError: () => {
      toast.error('Failed to generate share link')
    },
  })

  const { mutate: disableShare, isPending: isDisabling } = usePatch({
    onSuccess: () => {
      setIsPublic(false)
      queryClient.setQueriesData<PaginatedResponse<Quiz>>({ queryKey: [QUIZ_LIST] }, (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data.items.map((item) =>
              item.id === quiz.id ? { ...item, isPublic: false } : item
            ),
          },
        }
      })
      toast.success('Sharing disabled')
    },
    onError: () => {
      toast.error('Failed to disable sharing')
    },
  })

  const generateShareLink = () => enableShare(QUIZ_SHARE_ENABLE(quiz.id), {})
  const disableShareLink = () => disableShare(QUIZ_SHARE_DISABLE(quiz.id), {})

  const openQuiz = () => navigate(PATHS.app.quiz(quiz.id))

  const openDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConfirmOpen(true)
  }

  const confirmDelete = () => deleteQuiz(QUIZ_BY_ID(quiz.id))

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpen(true)
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

  return {
    shareToken,
    isPublic,
    publicUrl,
    copied,
    isModalOpen,
    isConfirmOpen,
    isMoveModalOpen,
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
    copyToClipboard,
    generateShareLink,
    disableShareLink,
    closeShareModal: () => setIsModalOpen(false),
    closeConfirm: () => setIsConfirmOpen(false),
    closeMoveModal: () => setIsMoveModalOpen(false),
  }
}
