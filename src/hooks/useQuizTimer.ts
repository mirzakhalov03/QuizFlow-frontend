import { useEffect, useRef, useState } from 'react'

function readInitialTime(storageKey: string, durationSeconds: number): number {
  if (typeof window === 'undefined') return 0
  const saved = localStorage.getItem(storageKey)
  const parsed = saved ? parseInt(saved, 10) : NaN
  return !isNaN(parsed) && parsed > 0 ? parsed : durationSeconds
}

export function useQuizTimer(
  durationSeconds: number,
  storageKey: string,
  onExpire: () => void,
  enabled = true
): { timeRemaining: number; isRunning: boolean } {
  const [timeRemaining, setTimeRemaining] = useState(() =>
    readInitialTime(storageKey, durationSeconds)
  )

  // Re-sync when the quiz/duration changes (e.g. the quiz finishes loading and
  // durationSeconds goes from 0 to its real value). Done during render via a
  // tracked key instead of an effect, which avoids a cascading re-render.
  // https://react.dev/learn/you-might-not-need-an-effect
  const syncKey = `${storageKey}:${durationSeconds}`
  const [syncedKey, setSyncedKey] = useState(syncKey)
  if (syncedKey !== syncKey) {
    setSyncedKey(syncKey)
    setTimeRemaining(readInitialTime(storageKey, durationSeconds))
  }

  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled || timeRemaining <= 0) return

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          localStorage.removeItem(storageKey)
          onExpireRef.current()
          return 0
        }
        localStorage.setItem(storageKey, String(next))
        return next
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // timeRemaining is intentionally omitted: the interval reads it via the
    // functional updater, so re-subscribing every tick would reset the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, storageKey])

  return { timeRemaining, isRunning: enabled && timeRemaining > 0 }
}
