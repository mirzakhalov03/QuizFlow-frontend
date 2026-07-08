import { PATHS } from '@/lib/path'
import { Link } from 'react-router-dom'
import { FolderPlus, Folder as FolderIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInfinite } from '@/hooks/useInfinite'
import { useDelete } from '@/hooks/useDelete'
import { Folder } from '@/types/folder'
import { useModal } from '@/hooks/useModal'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useState } from 'react'
import NewFolderModal, { NEW_FOLDER_MODAL_KEY } from '@/components/main/library/new-folder-modal'
import EditFolderModal from '@/components/main/library/edit-folder-modal'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { toast } from '@/lib/toast'
import { useQueryClient } from '@tanstack/react-query'

export default function Library() {
  const queryClient = useQueryClient()
  const {
    items: folders,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    observerRef,
  } = useInfinite<Folder>('/folders', {
    page_key: 'offset',
    initialPageParam: 0,
    limit_val: 24,
  })
  const { openModal } = useModal(NEW_FOLDER_MODAL_KEY)

  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Organize your quizzes into folders.</p>
        </div>
        <Button onClick={openModal} leftIcon={<FolderPlus size={18} />} disabled={isLoading}>
          New Folder
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <FolderCardSkeleton key={`initial-folder-skeleton-${i}`} />
          ))}
        </div>
      ) : folders.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center">
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

          {isFetchingNextPage &&
            Array.from({ length: 4 }).map((_, i) => (
              <FolderCardSkeleton key={"next-page-skeleton-" + i} />
            ))}

          {hasNextPage && (
            <div ref={observerRef} className="col-span-full h-1" />
          )}
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
  onDelete,
}: {
  folder: Folder
  onEdit: () => void
  onDelete: () => void
}) {
  const [menuOpen, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  return (
    <div ref={ref} className="group relative">
      <Link
        to={PATHS.app.libraryFolder(folder.id)}
        className="bg-card hover:border-primary border-border flex flex-col gap-2 rounded-xl border p-4 transition-all"
      >
        <FolderIcon className="text-primary" size={32} />
        <h3 className="truncate pr-6 font-semibold">{folder.name}</h3>
        <p className="text-muted-foreground text-sm">{folder.quizCount} quizzes</p>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(!menuOpen)
        }}
        className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-3 right-3 rounded-md p-1 transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {menuOpen && (
        <div className="bg-popover text-popover-foreground border-border absolute top-10 right-3 z-50 min-w-32 overflow-hidden rounded-md border py-1 shadow-lg">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
              setOpen(false)
            }}
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
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
            className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export function FolderCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading folder card"
      aria-busy="true"
      className="bg-card border-border relative flex flex-col gap-2 rounded-xl border p-4"
    >
      <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
      <div className="skeleton-shimmer h-5 w-3/4 rounded" />
      <div className="skeleton-shimmer h-4 w-1/2 rounded" />
      <div className="skeleton-shimmer absolute top-3 right-3 h-7 w-7 rounded-md" />
    </div>
  )
}
