import { useEffect, useRef, useState } from 'react'

export function useQuizTimer(
  durationSeconds: number,
  storageKey: string,
  onExpire: () => void,
  enabled = true
): { timeRemaining: number; isRunning: boolean } {
  const [timeRemaining, setTimeRemaining] = useState(() => {
    if (typeof window === 'undefined') return 0
    const saved = localStorage.getItem(storageKey)
    const parsed = saved ? parseInt(saved, 10) : NaN
    return !isNaN(parsed) && parsed > 0 ? parsed : durationSeconds
  })

  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    const parsed = saved ? parseInt(saved, 10) : NaN

    setTimeRemaining(!isNaN(parsed) && parsed > 0 ? parsed : durationSeconds)
  }, [durationSeconds, storageKey])

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
  // timeRemaining intentionally omitted — adding it would restart the interval every second
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, storageKey])

  return { timeRemaining, isRunning: enabled && timeRemaining > 0 }
}
