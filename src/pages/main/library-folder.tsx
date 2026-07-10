import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import {
  Folder as FolderIcon,
  ChevronLeft,
  Plus,
  FolderInput,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useGet } from '@/hooks/useGet'
import { useInfinite } from '@/hooks/useInfinite'
import { useDelete } from '@/hooks/useDelete'
import { ApiResponse } from '@/types/api'
import { Folder } from '@/types/folder'
import { Quiz } from '@/types/quiz'
import QuizCard, { QuizCardSkeleton } from '@/components/main/quizzes/quiz-card'
import { PATHS } from '@/lib/path'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import { useClickOutside } from '@/hooks/useClickOutside'
import Modal from '@/components/custom/modal'
import QuizFormWrapper from '@/components/main/quizzes/quiz-form-wrapper'
import AddExistingQuizzesModal from '@/components/main/library/add-existing-quizzes-modal'
import EditFolderModal from '@/components/main/library/edit-folder-modal'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { usePendingJobsStore } from '@/store/use-pending-jobs-store'
import { PendingQuizCard } from '@/components/main/quizzes/pending-quiz-card'
import { toast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'

export default function LibraryFolder() {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { openModal } = useModal('quiz-add')

  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useClickOutside<HTMLDivElement>(() => setIsMenuOpen(false))

  const allPendingJobs = usePendingJobsStore((s) => s.jobs)

  const folderPendingJobs = useMemo(
    () => allPendingJobs.filter((job) => job.folderId === folderId),
    [allPendingJobs, folderId]
  )

  const { data: folderData, isLoading: isLoadingFolder } = useGet<ApiResponse<Folder>>(
    `/folders/${folderId}`
  )
  const {
    items: quizzes,
    isLoading: isLoadingQuizzes,
    isFetchingNextPage,
    hasNextPage,
    observerRef,
  } = useInfinite<Quiz>(`/folders/${folderId}/quizzes`, {
    page_key: 'offset',
    initialPageParam: 0,
    limit_val: 20,
    options: {
      enabled: !!folderId,
    },
  })

  const folder = folderData?.data

  const { mutate: deleteFolder, isPending: isDeleting } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/folders'] })
      toast.success('Folder deleted successfully')
      navigate(PATHS.app.library)
    },
    onError: () => {
      toast.error('Failed to delete folder')
    },
  })

  if (isLoadingFolder) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <ChevronLeft size={14} />
            Back to Library
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <FolderIcon className="text-primary" size={24} />
              </div>
              <div className="skeleton-shimmer h-8 w-36 rounded-md" />
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button className="flex-1 sm:flex-none" variant="outline" disabled leftIcon={<FolderInput size={18} />}>
                Add Existing
              </Button>
              <Button className="flex-1 sm:flex-none" disabled leftIcon={<Plus size={18} />}>
                New Quiz
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <QuizCardSkeleton key={`initial-folder-quiz-skeleton-${i}`} />
          ))}
        </div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Folder not found.</p>
        <Link to={PATHS.app.library}>
          <Button variant="outline" leftIcon={<ChevronLeft size={18} />}>
            Back to Library
          </Button>
        </Link>
      </div>
    )
  }

  const showSkeletons = isLoadingQuizzes
  const isEmpty = !showSkeletons && quizzes.length === 0 && folderPendingJobs.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to={PATHS.app.library}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Library
        </Link>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FolderIcon className="text-primary" size={24} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{folder.name}</h1>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                {isMenuOpen && (
                  <div className="bg-popover text-popover-foreground border-border absolute top-8 left-0 z-50 min-w-32 overflow-hidden rounded-md border py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true)
                        setIsMenuOpen(false)
                      }}
                      className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                    >
                      <Pencil size={14} />
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        setIsConfirmDeleteOpen(true)
                        setIsMenuOpen(false)
                      }}
                      className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              className="flex-1 sm:flex-none"
              variant="outline"
              onClick={() => setIsAddExistingOpen(true)}
              leftIcon={<FolderInput size={18} />}
            >
              Add Existing
            </Button>
            <Button className="flex-1 sm:flex-none" onClick={openModal} leftIcon={<Plus size={18} />}>
              New Quiz
            </Button>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-muted-foreground border-border flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center">
          <p>No quizzes in this folder yet.</p>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddExistingOpen(true)}
              variant="outline"
              leftIcon={<FolderInput size={18} />}
            >
              Add Existing Quizzes
            </Button>
            <Button onClick={openModal} variant="outline" leftIcon={<Plus size={18} />}>
              Create New Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {showSkeletons ? (
            Array.from({ length: 8 }).map((_, i) => (
              <QuizCardSkeleton key={`initial-folder-quizzes-skeleton-${i}`} />
            ))
          ) : (
            <>
              {folderPendingJobs.map((job) => (
                <PendingQuizCard key={job.jobId} {...job} />
              ))}
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </>
          )}

          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <QuizCardSkeleton key={"next-page-skeleton-" + i} />
            ))}

          {hasNextPage && (
            <div ref={observerRef} className="col-span-full h-1" />
          )}
        </div>
      )}

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Create New Quiz" className="pb-0 sm:pb-0">
        <QuizFormWrapper folderId={folderId} />
      </Modal>

      <EditFolderModal
        folder={folder}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={() => folderId && deleteFolder(`/folders/${folderId}`)}
        title="Delete Folder?"
        description="This will permanently delete the folder. Quizzes inside will be moved to your root library."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
      />

      {folderId && (
        <AddExistingQuizzesModal
          folderId={folderId}
          isOpen={isAddExistingOpen}
          onClose={() => setIsAddExistingOpen(false)}
        />
      )}
    </div>
  )
}
