import { Check, Copy } from 'lucide-react'

import Modal from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Spinner from '@/components/ui/spinner'

type ShareQuizModalProps = {
  isOpen: boolean
  onClose: () => void
  isSharing: boolean
  shareToken: string | null
  publicUrl: string
  copied: boolean
  onCopy: () => void
  onRetry: () => void
}

export default function ShareQuizModal({
  isOpen,
  onClose,
  isSharing,
  shareToken,
  publicUrl,
  copied,
  onCopy,
  onRetry,
}: ShareQuizModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Quiz"
      description="Anyone with this link can view the quiz questions."
    >
      <div className="flex flex-col gap-4 py-4">
        {isSharing ? (
          <div className="flex h-20 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : !shareToken ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-destructive text-sm">Failed to generate share link.</p>
            <Button size="sm" onClick={onRetry}>
              Retry
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
              Note: This link allows read-only access. Users cannot submit answers or see correct
              ones.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
