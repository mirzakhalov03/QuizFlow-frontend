import { useState, useMemo } from 'react'
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
import { Folder as FolderIcon, Check, X, Search, FolderPlus, Info } from 'lucide-react'
import Spinner from '@/components/ui/spinner'
import { QUIZ_LIST } from '@/constants/api-endpoints'
import { cn } from '@/lib/utils'

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
  const [searchTerm, setSearchTerm] = useState('')

  const { data: foldersData, isLoading: isLoadingFolders } =
    useGet<ApiResponse<Folder[]>>('/folders')
  const { mutate: createFolder, isPending: isCreatingFolder } = usePost()
  const { mutate: moveQuiz, isPending: isMoving } = usePatch()

  const folders = foldersData?.data || []

  const filteredFolders = useMemo(() => {
    if (!searchTerm.trim()) return folders
    return folders.filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [folders, searchTerm])

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
    setSearchTerm('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Move Quiz" size="max-w-md">
      <div className="flex flex-col gap-4 py-2">
        <Input
          placeholder="Search folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefixIcon={<Search size={16} />}
          fullWidth
        />

        <div className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-border max-h-[350px] space-y-1 overflow-y-auto pr-1">
          {isLoadingFolders ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <>
              <button
                onClick={() => handleMove(null)}
                disabled={isMoving || !currentFolderId}
                className={cn(
                  'hover:bg-accent group flex w-full items-center justify-between rounded-lg p-3 transition-all duration-200',
                  !currentFolderId && 'bg-primary/5 ring-1 ring-primary/20 cursor-default'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                      !currentFolderId ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                    )}
                  >
                    <FolderIcon size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">Root Library</span>
                    <span className="text-muted-foreground text-xs">No specific folder</span>
                  </div>
                </div>
                {!currentFolderId && (
                  <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground" size={12} strokeWidth={3} />
                  </div>
                )}
              </button>

              <div className="h-2" />

              {filteredFolders.length === 0 && searchTerm && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                    <Search className="text-muted-foreground" size={20} />
                  </div>
                  <p className="text-muted-foreground text-sm">No folders found</p>
                </div>
              )}

              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMove(folder.id)}
                  disabled={isMoving || currentFolderId === folder.id}
                  className={cn(
                    'hover:bg-accent group flex w-full items-center justify-between rounded-lg p-3 transition-all duration-200',
                    currentFolderId === folder.id && 'bg-primary/5 ring-1 ring-primary/20 cursor-default'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                        currentFolderId === folder.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary'
                      )}
                    >
                      <FolderIcon size={18} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">{folder.name}</span>
                      <span className="text-muted-foreground text-xs">{folder.quizCount || 0} quizzes</span>
                    </div>
                  </div>
                  {currentFolderId === folder.id && (
                    <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                      <Check className="text-primary-foreground" size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="pt-2">
          {!showNewFolder ? (
            <button
              onClick={() => setShowNewFolder(true)}
              className="hover:bg-primary/5 hover:border-primary/40 text-primary flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm font-medium transition-all duration-200"
            >
              <FolderPlus size={18} />
              Create New Folder
            </button>
          ) : (
            <div className="bg-muted/30 flex flex-col gap-3 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">New Folder</span>
                <button onClick={() => setShowNewFolder(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  placeholder="Folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateAndMove()
                    }
                  }}
                  className="h-10"
                  fullWidth
                />
                <Button
                  onClick={handleCreateAndMove}
                  loading={isCreatingFolder}
                  disabled={!newFolderName.trim()}
                  className="h-10 shrink-0 px-4"
                >
                  Create
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-muted/20 -mx-6 mt-4 flex items-center gap-2 border-t border-border px-6 pt-4">
        <Info size={14} className="text-muted-foreground" />
        <p className="text-muted-foreground text-xs">
          Moving a quiz will update its location in your library.
        </p>
      </div>
    </Modal>
  )
}
