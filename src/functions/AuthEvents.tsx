type Event = 'SESSION_EXPIRED'

let handler: ((e: Event) => void) | null = null

export const authEvents = {
  on(cb: (e: Event) => void) {
    handler = cb
  },
  emit(e: Event) {
    handler?.(e)
  },
}
