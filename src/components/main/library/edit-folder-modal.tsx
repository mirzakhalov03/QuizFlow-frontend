import { useState } from 'react'
import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePatch } from '@/hooks/usePatch'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@/lib/toast'
import { FolderPen } from 'lucide-react'
import { Folder } from '@/types/folder'

interface EditFolderModalProps {
  folder: Folder | null
  isOpen: boolean
  onClose: () => void
}

export default function EditFolderModal({ folder, isOpen, onClose }: EditFolderModalProps) {
  // ✅ initialize from props (safe because we remount via key)
  const [name, setName] = useState(folder?.name ?? '')

  const queryClient = useQueryClient()
  const { mutate: updateFolder, isPending: isLoading } = usePatch()

  const handleClose = () => {
    setName('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isLoading || !folder) return

    updateFolder(
      `/folders/${folder.id}`,
      { name },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['/folders'] })
          queryClient.invalidateQueries({
            queryKey: [`/folders/${folder.id}`],
          })
          toast.success('Folder updated successfully')
          handleClose()
        },
        onError: () => {
          toast.error('Failed to update folder')
        },
      }
    )
  }

  return (
    <Modal
      key={folder?.id}
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Folder"
      size="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="edit-folder-name"
            className="text-muted-foreground text-xs font-bold tracking-wider uppercase"
          >
            Folder Name
          </label>

          <Input
            id="edit-folder-name"
            placeholder="e.g. Biology, History, My Quizzes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            prefixIcon={<FolderPen size={16} />}
            className="h-10 text-sm font-medium"
            fullWidth
            autoFocus
          />
        </div>

        <div className="bg-muted/10 border-border -mx-6 mt-2 -mb-6 flex items-center justify-end border-t px-6 py-4">
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={handleClose} className="h-9">
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isLoading}
              disabled={!name.trim() || name === folder?.name}
              className="h-9 px-6"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
