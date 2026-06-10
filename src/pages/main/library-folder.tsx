import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Folder as FolderIcon, ChevronLeft, Plus, FolderInput } from 'lucide-react'
import { useGet } from '@/hooks/useGet'
import { ApiResponse } from '@/types/api'
import { Folder } from '@/types/folder'
import { Quiz } from '@/types/quiz'
import QuizCard from '@/components/main/dashboard/quiz-card'
import Spinner from '@/components/ui/spinner'
import { PATHS } from '@/lib/path'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/useModal'
import Modal from '@/components/custom/modal'
import QuizFormWrapper from '@/components/main/quizzes/quiz-form-wrapper'
import AddExistingQuizzesModal from '@/components/main/library/add-existing-quizzes-modal'

export default function LibraryFolder() {
  const { folderId } = useParams()
  const { openModal } = useModal('quiz-add')
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false)

  const { data: folderData, isLoading: isLoadingFolder } = useGet<ApiResponse<Folder>>(
    `/folders/${folderId}`
  )
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useGet<ApiResponse<Quiz[]>>(
    `/folders/${folderId}/quizzes`
  )

  const folder = folderData?.data
  const quizzes = quizzesData?.data || []

  if (isLoadingFolder || isLoadingQuizzes) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FolderIcon className="text-primary" size={24} />
            </div>
            <h1 className="text-2xl font-bold">{folder.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsAddExistingOpen(true)} leftIcon={<FolderInput size={18} />}>
              Add Existing
            </Button>
            <Button onClick={openModal} leftIcon={<Plus size={18} />}>
              New Quiz
            </Button>
          </div>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
          <p>No quizzes in this folder yet.</p>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsAddExistingOpen(true)} variant="outline" leftIcon={<FolderInput size={18} />}>
              Add Existing Quizzes
            </Button>
            <Button onClick={openModal} variant="outline" leftIcon={<Plus size={18} />}>
              Create New Quiz
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      <Modal size="max-w-3xl" modalKey="quiz-add" title="Create New Quiz" className="pb-0 sm:pb-0">
        <QuizFormWrapper folderId={folderId} />
      </Modal>

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
