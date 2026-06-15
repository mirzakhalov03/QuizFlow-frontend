import { PATHS } from '@/lib/path'
import { Link } from 'react-router-dom'
import { FolderPlus, Folder as FolderIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGet } from '@/hooks/useGet'
import { ApiResponse } from '@/types/api'
import { Folder } from '@/types/folder'
import { useModal } from '@/hooks/useModal'
import NewFolderModal, { NEW_FOLDER_MODAL_KEY } from '@/components/main/library/new-folder-modal'
import Spinner from '@/components/ui/spinner'

export default function Library() {
  const { data, isLoading } = useGet<ApiResponse<Folder[]>>('/folders')
  const { openModal } = useModal(NEW_FOLDER_MODAL_KEY)

  const folders = data?.data || []

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
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center">
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
            <Link
              key={folder.id}
              to={PATHS.app.libraryFolder(folder.id)}
              className="bg-card hover:border-primary flex flex-col gap-2 rounded-xl border p-4 transition-all"
            >
              <FolderIcon className="text-primary" size={32} />
              <h3 className="truncate font-semibold">{folder.name}</h3>
              <p className="text-muted-foreground text-sm">{folder.quizCount} quizzes</p>
            </Link>
          ))}
        </div>
      )}

      <NewFolderModal />
    </div>
  )
}
