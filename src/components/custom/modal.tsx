import { useModal } from '@/hooks/useModal'
import { cn } from '@/lib/utils'
import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ClassNameValue } from 'tailwind-merge'
import { X } from 'lucide-react'

type Props = {
  modalKey?: string
  isOpen?: boolean
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: ClassNameValue
  classNameTitle?: ClassNameValue
  classNameIcon?: ClassNameValue
  closable?: boolean
  size?:
    | 'max-w-lg'
    | 'max-w-xl'
    | 'max-w-2xl'
    | 'max-w-3xl'
    | 'max-w-4xl'
    | 'max-w-5xl'
    | 'max-w-6xl'
    | 'max-w-[90%]'
    | 'max-w-full'
    | 'max-w-sm'
    | 'max-w-md'
  onClose?: () => void
}

const Modal = ({
  title,
  description,
  children,
  modalKey = 'default',
  isOpen: controlledIsOpen,
  classNameTitle,
  classNameIcon,
  className = '',
  size = 'max-w-lg',
  onClose,
  closable = true,
}: Props) => {
  const { isOpen: contextIsOpen, closeModal } = useModal(modalKey)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : contextIsOpen
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    }
    closeModal()
  }, [onClose, closeModal])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closable, handleClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closable && contentRef.current && !contentRef.current.contains(e.target as Node)) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70" />

      <div
        ref={contentRef}
        className={cn(
          'relative z-50 max-h-[90dvh] w-full overflow-y-auto rounded-lg border border-border bg-card text-card-foreground p-4 shadow-lg sm:p-6',
          size,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {closable && (
          <button
            onClick={handleClose}
            className={cn(
              'absolute top-4 right-4 rounded-sm text-muted-foreground opacity-70 ring-offset-background transition-opacity hover:text-foreground hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
              classNameIcon
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}

        {title && (
          <h2
            id="modal-title"
            className={cn(
              'text-lg leading-none font-semibold tracking-tight text-foreground',
              classNameTitle
            )}
          >
            {title}
          </h2>
        )}

        {description && (
          <p id="modal-description" className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className={title || description ? 'mt-4' : ''}>{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root') || document.body
  )
}

export default Modal
