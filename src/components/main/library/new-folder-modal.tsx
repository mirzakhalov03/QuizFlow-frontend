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
import { Search, CheckCircle2, Circle, FileQuestion, Calendar, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { TYPE_COLORS, TYPE_LABELS } from '../quizzes/utils'
import { useDebounce } from '@/hooks/useDebounce'

export const NEW_FOLDER_MODAL_KEY = 'new-folder'

export default function NewFolderModal() {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { isOpen, closeModal } = useModal(NEW_FOLDER_MODAL_KEY)
  const queryClient = useQueryClient()
  const { mutate: createFolder, isPending: isLoading } = usePost()

  // Fetch quizzes only when the modal is open, to allow pre-selecting existing quizzes
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useGet<PaginatedResponse<Quiz>>(
    QUIZ_LIST,
    {
      params: { 
        search: debouncedSearch || undefined,
        limit: 500,
      },
      enabled: isOpen,
    }
  )

  const availableQuizzes = useMemo(() => {
    if (!quizzesData?.data?.items) return []
    // Show all quizzes that don't have a folder yet
    return quizzesData.data.items.filter((quiz) => !quiz.folderId)
  }, [quizzesData])


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
    if (!name.trim() || isLoading) return

    const payload = {
      name,
      quizIds: Array.from(selectedIds),
    }

    createFolder('/folders', payload, {
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
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      modalKey={NEW_FOLDER_MODAL_KEY}
      title="Create New Folder"
      size="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="folder-name"
            className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
          >
            Folder Name
          </label>
          <Input
            id="folder-name"
            placeholder="e.g. Biology, History, My Quizzes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            prefixIcon={<FolderPlus size={16} />}
            className="h-10 text-sm font-medium"
            fullWidth
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Add Quizzes (Optional)
            </label>
            <span className="text-muted-foreground text-[10px] font-medium">
              Only ungrouped quizzes are shown
            </span>
          </div>

          <Input
            placeholder="Search quizzes by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefixIcon={<Search size={16} />}
            fullWidth
          />

          <div className="border-border scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-border bg-muted/20 max-h-60 overflow-y-auto rounded-xl border">
            {isLoadingQuizzes ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner />
              </div>
            ) : availableQuizzes.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center p-4 text-center">
                <div className="bg-muted mb-2 flex h-8 w-8 items-center justify-center rounded-full">
                  <FileQuestion className="text-muted-foreground" size={16} />
                </div>
                <p className="text-muted-foreground text-xs font-medium">
                  No ungrouped quizzes available.
                </p>
              </div>
            ) : availableQuizzes.length === 0 && debouncedSearch ? (
              <div className="flex h-32 flex-col items-center justify-center p-4 text-center">
                <div className="bg-muted mb-2 flex h-8 w-8 items-center justify-center rounded-full">
                  <Search className="text-muted-foreground" size={16} />
                </div>
                <p className="text-muted-foreground text-xs font-medium">
                  No match for &quot;{search}&quot;
                </p>
              </div>
            ) : (
              <div className="divide-border bg-background flex flex-col divide-y">
                {availableQuizzes.map((quiz) => {
                  const isSelected = selectedIds.has(quiz.id)
                  return (
                    <div
                      key={quiz.id}
                      className={cn(
                        'group flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-all duration-200',
                        isSelected ? 'bg-primary/5' : 'hover:bg-accent'
                      )}
                      onClick={() => toggleSelection(quiz.id)}
                    >
                      <div className="flex shrink-0 items-center justify-center">
                        {isSelected ? (
                          <CheckCircle2 className="text-primary h-4 w-4" />
                        ) : (
                          <Circle className="text-muted-foreground group-hover:text-primary/40 h-4 w-4" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate text-xs leading-tight font-semibold">
                          {quiz.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                              TYPE_COLORS[quiz.type ?? 'mixed']
                            )}
                          >
                            {TYPE_LABELS[quiz.type ?? 'mixed']}
                          </span>
                          <div className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                            <Calendar size={9} />
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
        </div>

        <div className="bg-muted/30 border-border -mx-6 mt-2 -mb-6 flex items-center justify-between border-t px-6 py-4">
          <div className="flex flex-col">
            {selectedIds.size > 0 ? (
              <>
                <span className="text-sm font-bold">{selectedIds.size} Selected</span>
                <p className="text-muted-foreground text-[11px]">Will be added to the new folder</p>
              </>
            ) : (
              <span className="text-muted-foreground text-sm font-medium italic">Empty folder</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={handleClose} className="h-9">
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={!name.trim()} className="h-9 px-6">
              Create Folder
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
