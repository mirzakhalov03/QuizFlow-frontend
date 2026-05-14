import { useEffect, useRef, useState } from 'react'

export function useQuizTimer(
  durationSeconds: number,
  storageKey: string,
  onExpire: () => void,
  enabled = true
): { timeRemaining: number; isRunning: boolean } {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed) && parsed > 0) return parsed
    }
    return durationSeconds
  })

  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled || durationSeconds <= 0) return

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
  }, [enabled, storageKey, durationSeconds])

  return { timeRemaining, isRunning: enabled && timeRemaining > 0 }
}
