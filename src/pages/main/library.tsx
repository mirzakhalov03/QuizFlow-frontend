import { PATHS } from '@/lib/path'
import { Link } from 'react-router-dom'
import { FolderPlus, Folder as FolderIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGet } from '@/hooks/useGet'
import { useDelete } from '@/hooks/useDelete'
import { ApiResponse } from '@/types/api'
import { Folder } from '@/types/folder'
import { useModal } from '@/hooks/useModal'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useState } from 'react'
import NewFolderModal, { NEW_FOLDER_MODAL_KEY } from '@/components/main/library/new-folder-modal'
import EditFolderModal from '@/components/main/library/edit-folder-modal'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import Spinner from '@/components/ui/spinner'
import { toast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'

export default function Library() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useGet<ApiResponse<Folder[]>>('/folders')
  const { openModal } = useModal(NEW_FOLDER_MODAL_KEY)
  
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)

  const folders = data?.data || []

  const { mutate: deleteFolder, isPending: isDeleting } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/folders'] })
      toast.success('Folder deleted successfully')
      setDeletingFolderId(null)
    },
    onError: () => {
      toast.error('Failed to delete folder')
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="text-muted-foreground">Organize your quizzes into folders.</p>
        </div>
        <Button onClick={openModal} leftIcon={<FolderPlus size={18} />}>
          New Folder
        </Button>
      </div>

      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center border-border">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <FolderIcon className="text-muted-foreground" size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No folders yet</h3>
            <p className="text-muted-foreground">Create your first folder to start organizing.</p>
          </div>
          <Button onClick={openModal} variant="outline" leftIcon={<FolderPlus size={18} />}>
            Create Folder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <FolderCard 
              key={folder.id} 
              folder={folder} 
              onEdit={() => setEditingFolder(folder)}
              onDelete={() => setDeletingFolderId(folder.id)}
            />
          ))}
        </div>
      )}

      <NewFolderModal />
      <EditFolderModal 
        folder={editingFolder} 
        isOpen={!!editingFolder} 
        onClose={() => setEditingFolder(null)} 
      />
      <ConfirmDialog
        isOpen={!!deletingFolderId}
        onClose={() => setDeletingFolderId(null)}
        onConfirm={() => deletingFolderId && deleteFolder(`/folders/${deletingFolderId}`)}
        title="Delete Folder?"
        description="This will permanently delete the folder. Quizzes inside will be moved to your root library."
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeleting}
      />
    </div>
  )
}

function FolderCard({ 
  folder, 
  onEdit, 
  onDelete 
}: { 
  folder: Folder; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  return (
    <div ref={ref} className="group relative">
      <Link
        to={PATHS.app.libraryFolder(folder.id)}
        className="bg-card hover:border-primary flex flex-col gap-2 rounded-xl border border-border p-4 transition-all"
      >
        <FolderIcon className="text-primary" size={32} />
        <h3 className="truncate font-semibold pr-6">{folder.name}</h3>
        <p className="text-muted-foreground text-sm">{folder.quizCount} quizzes</p>
      </Link>
      
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(!menuOpen)
        }}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpen && (
        <div className="bg-popover text-popover-foreground border-border absolute top-10 right-3 z-50 min-w-32 rounded-md border shadow-lg overflow-hidden py-1">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
