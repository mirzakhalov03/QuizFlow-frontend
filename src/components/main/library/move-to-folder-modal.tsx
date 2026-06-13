import { useState } from 'react'
import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGet } from '@/hooks/useGet'
import { usePatch } from '@/hooks/usePatch'
import { usePost } from '@/hooks/usePost'
import { useQueryClient } from '@tanstack/react-query'
import { ApiResponse } from '@/types/api'
import { Folder } from '@/types/folder'
import { toast } from '@/lib/toast'
import { Folder as FolderIcon, Check, Plus, X } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { QUIZ_LIST } from '@/constants/api-endpoints'

interface MoveToFolderModalProps {
  quizId: string
  currentFolderId?: string | null
  isOpen: boolean
  onClose: () => void
}

export default function MoveToFolderModal({
  quizId,
  currentFolderId,
  isOpen,
  onClose,
}: MoveToFolderModalProps) {
  const queryClient = useQueryClient()
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const { data: foldersData, isLoading: isLoadingFolders } =
    useGet<ApiResponse<Folder[]>>('/folders')
  const { mutate: createFolder, isPending: isCreatingFolder } = usePost()
  const { mutate: moveQuiz, isPending: isMoving } = usePatch()

  const folders = foldersData?.data || []

  const handleMove = (folderId: string | null) => {
    moveQuiz(
      `/folders/quizzes/${quizId}`,
      { folderId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [QUIZ_LIST] })
          if (currentFolderId) {
            queryClient.invalidateQueries({ queryKey: [`/folders/${currentFolderId}/quizzes`] })
          }
          if (folderId) {
            queryClient.invalidateQueries({ queryKey: [`/folders/${folderId}/quizzes`] })
          }
          queryClient.invalidateQueries({ queryKey: ['/folders'] })
          toast.success('Quiz moved successfully')
          onClose()
        },
        onError: () => {
          toast.error('Failed to move quiz')
        },
      }
    )
  }

  const handleCreateAndMove = () => {
    if (!newFolderName.trim() || isCreatingFolder) return
    createFolder(
      '/folders',
      { name: newFolderName },
      {
        onSuccess: (res) => {
          const newFolderId = res.data.id
          handleMove(newFolderId)
        },
        onError: () => {
          toast.error('Failed to create folder')
        },
      }
    )
  }

  const handleClose = () => {
    setShowNewFolder(false)
    setNewFolderName('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Move to Folder">
      <div className="flex flex-col gap-2 py-4">
        {isLoadingFolders ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <>
            <button
              onClick={() => handleMove(null)}
              disabled={isMoving || !currentFolderId}
              className="hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3 text-sm font-medium">
                <FolderIcon className="text-muted-foreground" size={20} />
                No Folder (Root)
              </div>
              {!currentFolderId && <Check className="text-primary" size={18} />}
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleMove(folder.id)}
                disabled={isMoving || currentFolderId === folder.id}
                className="hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3 text-sm font-medium">
                  <FolderIcon className="text-primary" size={20} />
                  {folder.name}
                </div>
                {currentFolderId === folder.id && <Check className="text-primary" size={18} />}
              </button>
            ))}

            {!showNewFolder ? (
              <button
                onClick={() => setShowNewFolder(true)}
                className="hover:bg-muted border-primary/30 mt-2 flex items-center gap-3 rounded-lg border border-dashed p-3 text-sm font-medium transition-colors text-primary"
              >
                <Plus size={20} />
                Create New Folder
              </button>
            ) : (
              <div className="bg-muted/50 border-primary/20 mt-2 flex items-center gap-2 rounded-lg border p-2">
                <Input
                  autoFocus
                  placeholder="New folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateAndMove()
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateAndMove}
                  loading={isCreatingFolder}
                  disabled={!newFolderName.trim()}
                >
                  Create & Move
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setShowNewFolder(false)}>
                  <X size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  )
}
