import { useQueryClient } from '@tanstack/react-query'
import { Check, Link2, Link2OffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useGet } from '@/hooks/useGet'
import { useDelete } from '@/hooks/useDelete'
import { toast } from '@/lib/toast'
import { INTEGRATIONS, INTEGRATION_BY_PROVIDER } from '@/constants/api-endpoints'
import { userIntegrationService } from '@/api/services/userIntegration.service'
import {
  INTEGRATION_PROVIDERS,
  type Integration,
  type IntegrationProvider,
} from '@/types/integration'

import NotionLogo from '@/assets/notionLogo.png'

type ProviderMeta = {
  name: string
  description: string
  icon: string
}

const PROVIDER_META: Record<IntegrationProvider, ProviderMeta> = {
  notion: {
    name: 'Notion',
    description: 'Sync notes, templates, and study material directly from your workspace.',
    icon: NotionLogo,
  },
}

export default function ConnectedApps() {
  const queryClient = useQueryClient()

  const { data: integrations, isLoading } = useGet<Integration[]>(INTEGRATIONS)

  const connected = new Set(integrations?.map((i) => i.provider) ?? [])

  const {
    mutate: disconnect,
    isPending: isDisconnecting,
    variables: pendingUrl,
  } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INTEGRATIONS] })
      toast.success('Integration disconnected')
    },
  })

  const handleConnect = (provider: IntegrationProvider) => {
    userIntegrationService.startConnect(provider)
  }

  const handleDisconnect = (provider: IntegrationProvider) => {
    disconnect(INTEGRATION_BY_PROVIDER(provider))
  }

  return (
    <div className="border-border bg-background rounded-2xl border p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 lg:p-8">
      <h2 className="text-lg font-semibold">Connected apps</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Manage external services tied to your account.
      </p>

      <div className="mt-5 space-y-4">
        {INTEGRATION_PROVIDERS.map((provider) => {
          const meta = PROVIDER_META[provider]
          const isConnected = connected.has(provider)
          const isPendingThis = isDisconnecting && pendingUrl === INTEGRATION_BY_PROVIDER(provider)

          return (
            <article key={provider} className="border-border rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <img src={meta.icon} alt={`${meta.name} logo`} className="h-6 w-6" />
                  </span>
                  <h3 className="font-semibold">{meta.name}</h3>
                </div>

                {isConnected ? (
                  <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    <Check size={12} />
                    Connected
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
                    Not connected
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mt-2 text-sm">{meta.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {isConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Link2OffIcon size={14} />}
                    onClick={() => handleDisconnect(provider)}
                    loading={isPendingThis}
                    disabled={isLoading}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    leftIcon={<Link2 size={14} />}
                    onClick={() => handleConnect(provider)}
                    disabled={isLoading}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
