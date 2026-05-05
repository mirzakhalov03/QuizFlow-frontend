import { useModal } from '@/hooks/useModal'
import { cn } from '@/lib/utils'
import { ReactNode, useCallback, useEffect, useRef } from 'react'
import { ClassNameValue } from 'tailwind-merge'
import { X } from 'lucide-react'

type Props = {
  modalKey?: string
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
  classNameTitle,
  classNameIcon,
  className = '',
  size = 'max-w-lg',
  onClose,
  closable = true,
}: Props) => {
  const { isOpen, closeModal } = useModal(modalKey)
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
    if (closable && e.target === overlayRef.current) {
      handleClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        ref={contentRef}
        className={cn(
          'relative z-50 w-full rounded-lg border bg-white p-6 shadow-lg',
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
              'absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none',
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
            className={cn('text-lg leading-none font-semibold tracking-tight', classNameTitle)}
          >
            {title}
          </h2>
        )}

        {description && (
          <p id="modal-description" className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        )}

        <div className={title || description ? 'mt-4' : ''}>{children}</div>
      </div>
    </div>
  )
}

export default Modal
