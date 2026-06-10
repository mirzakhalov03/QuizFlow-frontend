import { useState, useMemo } from 'react'
import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePost } from '@/hooks/usePost'
import { useGet } from '@/hooks/useGet'
import { useQueryClient } from '@tanstack/react-query'
import { useModal } from '@/hooks/useModal'
import { toast } from '@/lib/toast'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { PaginatedResponse } from '@/types/api'
import { Quiz } from '@/types/quiz'
import Spinner from '@/components/ui/spinner'

export const NEW_FOLDER_MODAL_KEY = 'new-folder'

export default function NewFolderModal() {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { isOpen, closeModal } = useModal(NEW_FOLDER_MODAL_KEY)
  const queryClient = useQueryClient()
  const { mutate: createFolder, isPending: isLoading } = usePost()

  // Fetch quizzes only when the modal is open, to allow pre-selecting existing quizzes
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useGet<PaginatedResponse<Quiz>>(
    QUIZ_LIST,
    {
      params: { limit: 500 },
      enabled: isOpen,
    }
  )

  const availableQuizzes = useMemo(() => {
    if (!quizzesData?.data?.items) return []
    // Allow users to add any quizzes that aren't already grouped, or just all quizzes.
    // For simplicity, we can show all quizzes that don't have a folder yet.
    return quizzesData.data.items.filter((quiz) => !quiz.folderId)
  }, [quizzesData])

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

  const handleClose = () => {
    setName('')
    setSearch('')
    setSelectedIds(new Set())
    closeModal()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const payload = {
      name,
      quizIds: Array.from(selectedIds),
    }

    createFolder(
      '/folders',
      payload,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/folders'] })
          if (payload.quizIds.length > 0) {
            queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
          }
          toast.success('Folder created successfully')
          handleClose()
        },
        onError: () => {
          toast.error('Failed to create folder')
        },
      }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} modalKey={NEW_FOLDER_MODAL_KEY} title="Create New Folder" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="folder-name" className="text-sm font-medium">
            Folder Name
          </label>
          <Input
            id="folder-name"
            placeholder="e.g. Biology, History, My Quizzes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Add Existing Quizzes (Optional)
          </label>
          <Input
            placeholder="Search quizzes to add..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />

          <div className="border-border max-h-60 overflow-y-auto rounded-lg border">
            {isLoadingQuizzes ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner />
              </div>
            ) : availableQuizzes.length === 0 ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                No ungrouped quizzes available to add.
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
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
                      onChange={() => {}}
                      onClick={(e) => e.stopPropagation()}
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
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground text-sm">
            {selectedIds.size > 0 ? `${selectedIds.size} quiz(zes) selected` : ''}
          </span>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={!name.trim()}>
              Create Folder
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
