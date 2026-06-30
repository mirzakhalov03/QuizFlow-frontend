import type { ReactNode } from 'react'
import { useToastStore, type ToastType } from '../store/toast-store'

type Options = {
  id?: string | number
  description?: ReactNode
  duration?: number
  dismissible?: boolean
}

const fire = (type: ToastType, title: ReactNode, o?: Options) =>
  useToastStore.getState().add({ type, title, ...o })

export const toast = Object.assign((title: ReactNode, o?: Options) => fire('default', title, o), {
  success: (t: ReactNode, o?: Options) => fire('success', t, o),
  error: (t: ReactNode, o?: Options) => fire('error', t, o),
  info: (t: ReactNode, o?: Options) => fire('info', t, o),
  warning: (t: ReactNode, o?: Options) => fire('info', t, o),
  loading: (t: ReactNode, o?: Options) => fire('loading', t, o),
  dismiss: (id?: string | number) => {
    const s = useToastStore.getState()
    if (id == null) s.clear()
    else s.remove(id)
  },
  promise: async <T,>(
    p: Promise<T>,
    msgs: {
      loading: ReactNode
      success: ReactNode | ((data: T) => ReactNode)
      error: ReactNode | ((err: unknown) => ReactNode)
    }
  ) => {
    const id = fire('loading', msgs.loading)
    const store = useToastStore.getState()
    try {
      const data = await p
      store.add({
        id,
        type: 'success',
        title:
          typeof msgs.success === 'function'
            ? (msgs.success as (d: T) => ReactNode)(data)
            : msgs.success,
      })
      return data
    } catch (err) {
      store.add({
        id,
        type: 'error',
        title:
          typeof msgs.error === 'function'
            ? (msgs.error as (e: unknown) => ReactNode)(err)
            : msgs.error,
      })
      throw err
    }
  },
})
