import { useLocation } from 'react-router-dom'
import { createContext, FC, ReactNode, useCallback, useContext, useState } from 'react'

type ModalContextType = {
  modals: Record<string, boolean>
  openModal: (key: string) => void
  closeModal: (key: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const ModalProviderInner: FC<{ children: ReactNode }> = ({ children }) => {
  const [modals, setModals] = useState<Record<string, boolean>>({})

  const openModal = useCallback((key: string) => {
    setModals((prev) => ({ ...prev, [key]: true }))
  }, [])

  const closeModal = useCallback((key: string) => {
    setModals((prev) => ({ ...prev, [key]: false }))
  }, [])

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  )
}

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()

  return <ModalProviderInner key={location.pathname}>{children}</ModalProviderInner>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider')
  }
  return context
}
