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

const PROVIDER_ICONS: Record<string, string | null> = {
  openai: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
  anthropic: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
  google: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
  openrouter: 'https://www.google.com/s2/favicons?domain=openrouter.ai&sz=128',
}

export default function ByokSection() {
  const queryClient = useQueryClient()
  const { openModal } = useModal('byok-modal')
  const { setData, getData,clearKey } = useGlobalStore()
  const { data: byokResponse, isLoading } = useGet<PaginatedResponse<ByokKey>>(BYOK)
  const byokKeys = byokResponse?.data?.items || []
  const {
    mutate: deleteKey,
    isPending: isDeleting,
    variables: deletingId,
  } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BYOK] })
      toast.success('API key deleted')
    },
  })
  const handleEdit = (value: ByokKey) => {
    setData(BYOK, value)
    openModal()
  }
  const handleAdd = ()=>{
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
        <Button size="sm" onClick={() => handleAdd()} leftIcon={<Plus size={16} />}>
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
            <p className="text-muted-foreground mx-auto mt-2 max-w-[300px] text-sm">
              Add your first AI provider key to start generating quizzes using your own credits.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-6"
              onClick={() => handleAdd()}
              leftIcon={<Plus size={16} />}
            >
              Add Your First Key
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {byokKeys.map((key) => (
              <ByokKeyCard
                key={key.id}
                apiKey={key}
                icon={PROVIDER_ICONS[key.provider.toLowerCase()] || null}
                onEdit={handleEdit}
                onDelete={(id) => deleteKey(BYOK_BY_ID(id))}
                isDeleting={isDeleting && deletingId === BYOK_BY_ID(key.id)}
              />
            ))}
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
    </div>
  )
}
