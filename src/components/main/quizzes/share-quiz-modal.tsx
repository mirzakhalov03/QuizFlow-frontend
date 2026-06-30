import { Check, Copy } from 'lucide-react'

import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Spinner from '@/components/ui/spinner'

type ShareQuizModalProps = {
  isOpen: boolean
  onClose: () => void
  isPublic: boolean
  isSharing: boolean
  isDisabling: boolean
  shareToken: string | null
  publicUrl: string
  copied: boolean
  onCopy: () => void
  onEnable: () => void
  onDisable: () => void
}

export default function ShareQuizModal({
  isOpen,
  onClose,
  isPublic,
  isSharing,
  isDisabling,
  shareToken,
  publicUrl,
  copied,
  onCopy,
  onEnable,
  onDisable,
}: ShareQuizModalProps) {
  const isLive = isPublic && !!shareToken

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Quiz"
      description="Anyone with the link can solve this quiz and see their score."
    >
      <div className="flex flex-col gap-4 py-4">
        {isSharing ? (
          <div className="flex h-20 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : !isLive ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-muted-foreground text-sm">
              Sharing is off. Turn it on to get a public link anyone can solve.
            </p>
            <Button size="sm" onClick={onEnable}>
              Enable sharing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input value={publicUrl} readOnly fullWidth />
              <Button size="icon" variant="outline" onClick={onCopy} aria-label="Copy link">
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Solvers can answer and see their score and the correct answers — but never your
              explanations.
            </p>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDisable}
              disabled={isDisabling}
              className="self-start"
            >
              {isDisabling ? 'Disabling…' : 'Disable sharing'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
