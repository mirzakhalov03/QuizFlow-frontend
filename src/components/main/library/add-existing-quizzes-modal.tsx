import { useState, useMemo } from 'react'
import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { useGet } from '@/hooks/useGet'
import { usePatch } from '@/hooks/usePatch'
import { useQueryClient } from '@tanstack/react-query'
import { PaginatedResponse } from '@/types/api'
import { Quiz } from '@/types/quiz'
import { toast } from '@/lib/toast'
import Spinner from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { QUIZ_LIST } from '@/constants/api-endpoints'

export const ADD_QUIZZES_MODAL_KEY = 'add-existing-quizzes'

interface AddExistingQuizzesModalProps {
  folderId: string
  isOpen: boolean
  onClose: () => void
}

export default function AddExistingQuizzesModal({
  folderId,
  isOpen,
  onClose,
}: AddExistingQuizzesModalProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Fetch quizzes, excluding ones already in this folder
  const { data: quizzesData, isLoading } = useGet<PaginatedResponse<Quiz>>(QUIZ_LIST, {
    params: { limit: 500, excludeFolderId: folderId },
    enabled: isOpen,
  })

  const { mutate: addQuizzes, isPending: isAdding } = usePatch({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
      queryClient.invalidateQueries({ queryKey: [`/folders/${folderId}/quizzes`] })
      queryClient.invalidateQueries({ queryKey: ['/folders'] })
      toast.success('Quizzes added to folder')
      setSelectedIds(new Set())
      onClose()
    },
    onError: () => {
      toast.error('Failed to add quizzes')
    },
  })

  const availableQuizzes = useMemo(() => {
    if (!quizzesData?.data?.items) return []
    return quizzesData.data.items
  }, [quizzesData])

  // Apply local search filter
  const filteredQuizzes = useMemo(() => {
    if (!search.trim()) return availableQuizzes
    const term = search.toLowerCase()
    return availableQuizzes.filter((quiz) => quiz.title.toLowerCase().includes(term))
  }, [availableQuizzes, search])

  const toggleSelection = (quizId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(quizId)) {
      newSelected.delete(quizId)
    } else {
      newSelected.add(quizId)
    }
    setSelectedIds(newSelected)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.size === 0) return

    addQuizzes(`/folders/${folderId}/add-quizzes`, { quizIds: Array.from(selectedIds) })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Existing Quizzes" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <Input
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />

        <div className="border-border max-h-96 min-h-64 overflow-y-auto rounded-lg border">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner />
            </div>
          ) : availableQuizzes.length === 0 ? (
            <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
              No available quizzes to add.
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-muted-foreground flex h-64 items-center justify-center text-sm">
              No quizzes match your search.
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {filteredQuizzes.map((quiz) => (
                <li
                  key={quiz.id}
                  className="hover:bg-muted flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
                  onClick={() => toggleSelection(quiz.id)}
                >
                  <input
                    type="checkbox"
                    className="border-input text-primary focus:ring-primary h-4 w-4 rounded transition-all"
                    checked={selectedIds.has(quiz.id)}
                    onChange={() => {}} // Handled by li onClick
                    onClick={(e) => e.stopPropagation()} // Prevent double toggle
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{quiz.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {quiz.type ? quiz.type.replace('_', ' ') : 'mixed'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-muted-foreground text-sm">
            {selectedIds.size} quiz{selectedIds.size === 1 ? '' : 'zes'} selected
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedIds.size === 0 || isAdding} loading={isAdding}>
              Add to Folder
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
