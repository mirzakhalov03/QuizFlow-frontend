import { useLocation } from 'react-router-dom'
import { createContext, FC, ReactNode, useCallback, useContext, useState } from 'react'

type ModalContextType = {
  modals: Record<string, boolean>
  openModal: (key: string) => void
  closeModal: (key: string) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const ModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()
  const [modals, setModals] = useState<Record<string, boolean>>({})

  // Close any open modals when the route changes. This used to be done by
  // keying ModalProviderInner on location.pathname, but that remounted the
  // entire app subtree (children === the whole <Outlet/> tree) on every
  // navigation — thrashing state and replaying mount animations like the
  // sidebar fill. Resetting during render (React's recommended pattern for
  // adjusting state on a prop change) closes modals on navigate without the
  // remount and without an effect round-trip.
  const [prevPath, setPrevPath] = useState(location.pathname)
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname)
    setModals({})
  }

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

// eslint-disable-next-line react-refresh/only-export-components
export const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider')
  }
  return context
}
