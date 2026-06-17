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
import { Search, CheckCircle2, Circle, FileQuestion, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { TYPE_COLORS, TYPE_LABELS } from '../quizzes/utils'

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

  const toggleAll = () => {
    if (selectedIds.size === filteredQuizzes.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredQuizzes.map((q) => q.id)))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.size === 0 || isAdding) return

    addQuizzes(`/folders/${folderId}/add-quizzes`, { quizIds: Array.from(selectedIds) })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Quizzes to Folder" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <Input
          placeholder="Search quizzes by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefixIcon={<Search size={16} />}
          fullWidth
        />

        <div className="flex items-center justify-between px-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Available Quizzes ({filteredQuizzes.length})
          </p>
          {filteredQuizzes.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-primary text-xs font-medium hover:underline"
            >
              {selectedIds.size === filteredQuizzes.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="border-border scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-border bg-muted/20 max-h-[400px] min-h-[300px] overflow-y-auto rounded-xl border">
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Spinner />
            </div>
          ) : availableQuizzes.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <FileQuestion className="text-muted-foreground" size={24} />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                All your quizzes are already in this folder.
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Search className="text-muted-foreground" size={24} />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                No quizzes match &quot;{search}&quot;
              </p>
            </div>
          ) : (
            <div className="divide-border flex flex-col divide-y">
              {filteredQuizzes.map((quiz) => {
                const isSelected = selectedIds.has(quiz.id)
                return (
                  <div
                    key={quiz.id}
                    className={cn(
                      'group flex cursor-pointer items-center gap-4 px-4 py-3 transition-all duration-200',
                      isSelected ? 'bg-primary/5' : 'hover:bg-accent'
                    )}
                    onClick={() => toggleSelection(quiz.id)}
                  >
                    <div className="flex shrink-0 items-center justify-center">
                      {isSelected ? (
                        <CheckCircle2 className="text-primary h-5 w-5" />
                      ) : (
                        <Circle className="text-muted-foreground group-hover:text-primary/50 h-5 w-5" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="truncate text-sm leading-none font-semibold">
                        {quiz.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                            TYPE_COLORS[quiz.type ?? 'mixed']
                          )}
                        >
                          {TYPE_LABELS[quiz.type ?? 'mixed']}
                        </span>
                        <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Calendar size={10} />
                          {dayjs(quiz.createdAt).format('MMM D, YYYY')}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-muted/30 border-border -mx-6 mt-2 -mb-6 flex items-center justify-between border-t px-6 py-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold">{selectedIds.size} Selected</span>
            <p className="text-muted-foreground text-[11px]">Ready to be added to this folder</p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="h-9 px-4">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedIds.size === 0 || isAdding}
              loading={isAdding}
              className="h-9 px-6"
            >
              Add to Folder
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
