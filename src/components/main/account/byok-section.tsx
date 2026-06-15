import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Key } from 'lucide-react'
import Button from '@/components/ui/button'
import { useGet } from '@/hooks/useGet'
import { useDelete } from '@/hooks/useDelete'
import { toast } from '@/lib/toast'
import { BYOK, BYOK_BY_ID } from '@/constants/api-endpoints'
import { ByokKey } from '@/types/byok'
import Modal from '@/components/custom/modal'
import { useModal } from '@/hooks/useModal'
import ByokModal from './byok-modal'
import { ByokKeyCard } from './byok-key-card'
import { ByokSkeleton } from './byok-skeleton'
import { useGlobalStore } from '@/store/global-store'
import { PaginatedResponse } from '@/types/api'

const PROVIDER_ICONS = {
  openai: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
  anthropic: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
  google: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
  openrouter: 'https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128',
}

export default function ByokSection() {
  const queryClient = useQueryClient()
  const { openModal } = useModal('byok-modal')
  const { openModal: openDeleteModal, closeModal: closeDeleteModal } = useModal('byok-delete')
  const { setData, getData, clearKey } = useGlobalStore()
  const { data: byokResponse, isLoading } = useGet<PaginatedResponse<ByokKey>>(BYOK)
  const byokKeys = byokResponse?.data?.items || []
  const [keyToDelete, setKeyToDelete] = useState<ByokKey | null>(null)
  const {
    mutate: deleteKey,
    isPending: isDeleting,
    variables: deletingId,
  } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BYOK] })
      toast.success('API key deleted')
      closeDeleteModal()
      setKeyToDelete(null)
    },
  })

  const requestDelete = (key: ByokKey) => {
    setKeyToDelete(key)
    openDeleteModal()
  }

  const confirmDelete = () => {
    if (keyToDelete) deleteKey(BYOK_BY_ID(keyToDelete.id))
  }
  const handleEdit = (value: ByokKey) => {
    setData(BYOK, value)
    openModal()
  }
  const handleAdd = () => {
    clearKey(BYOK)
    openModal()
  }
  const item = getData(BYOK)

  return (
    <div className="border-border bg-background rounded-2xl border p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">AI API Keys (BYOK)</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Use your own API keys for quiz generation.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} leftIcon={<Plus size={16} />}>
          Add Key
        </Button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ByokSkeleton key={i} />
            ))}
          </div>
        ) : byokKeys.length === 0 ? (
          <div className="bg-muted/20 flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
            <div className="bg-background mb-4 flex h-14 w-14 items-center justify-center rounded-full shadow-sm">
              <Key size={28} className="text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold">No API keys yet</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-75 text-sm">
              Add your first AI provider key to start generating quizzes using your own credits.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={handleAdd}
              leftIcon={<Plus size={16} />}
            >
              Add Your First Key
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {byokKeys.map((key) => {
              const provider = key.provider.toLowerCase() as keyof typeof PROVIDER_ICONS
              return (
                <ByokKeyCard
                  key={key.id}
                  apiKey={key}
                  icon={PROVIDER_ICONS[provider] ?? null}
                  onEdit={handleEdit}
                  onDelete={() => requestDelete(key)}
                  isDeleting={isDeleting && deletingId === BYOK_BY_ID(key.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      <Modal
        modalKey="byok-modal"
        title={item ? 'Edit API Key' : 'Add API Key'}
        description={
          item
            ? 'Update your API key details.'
            : 'Enter your provider API key. It will be encrypted at rest.'
        }
      >
        <ByokModal />
      </Modal>

      <Modal
        modalKey="byok-delete"
        title="Delete API key"
        description={
          keyToDelete
            ? `This will permanently remove "${keyToDelete.keyName}". This can't be undone.`
            : ''
        }
        size="max-w-sm"
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={closeDeleteModal} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" loading={isDeleting} onClick={confirmDelete}>
            Delete key
          </Button>
        </div>
      </Modal>
    </div>
  )
}
