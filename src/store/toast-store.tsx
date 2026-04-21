import { create } from "zustand"
import type { ReactNode } from "react"

export type ToastType = "default" | "success" | "error" | "info" | "loading"

export type ToastItem = {
    id: string | number
    type: ToastType
    title?: ReactNode
    description?: ReactNode
    duration: number
    dismissible: boolean
    createdAt: number
}

type ToastStore = {
    toasts: ToastItem[]
    add: (t: Partial<ToastItem> & { type: ToastType }) => string | number
    update: (id: string | number, patch: Partial<ToastItem>) => void
    remove: (id: string | number) => void
    clear: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    add: (t) => {
        const id = t.id ?? Math.random().toString(36).slice(2)
        const next: ToastItem = {
            id,
            type: t.type,
            title: t.title,
            description: t.description,
            duration:
                t.duration ?? (t.type === "loading" ? Infinity : 4000),
            dismissible: t.dismissible ?? true,
            createdAt: Date.now(),
        }
        set((s) => {
            const i = s.toasts.findIndex((x) => x.id === id)
            if (i >= 0) {
                const copy = [...s.toasts]
                copy[i] = next
                return { toasts: copy }
            }
            return { toasts: [...s.toasts, next] }
        })
        return id
    },
    update: (id, patch) =>
        set((s) => ({
            toasts: s.toasts.map((x) =>
                x.id === id ? { ...x, ...patch } : x,
            ),
        })),
    remove: (id) =>
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
    clear: () => set({ toasts: [] }),
}))
